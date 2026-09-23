import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

const FORWARDED_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "x-requested-with",
  "x-device-type",
  "x-platform",
  "x-business-id",
  "x-outlet-id",
];

async function handleProxyRequest(
  request: NextRequest,
  context: RouteContext,
  method: string
): Promise<NextResponse> {
  try {
    const { path } = await context.params;
    const targetPath = Array.isArray(path) ? path.join("/") : "";

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://smartpos-api.servicefixit.me/api/v1").replace(/\/+$/, "");

    const search = request.nextUrl.search;
    const targetUrl = `${baseUrl}/${targetPath}${search}`;

    const headers: Record<string, string> = {};
    for (const key of FORWARDED_HEADERS) {
      const val = request.headers.get(key);
      if (val) {
        headers[key] = val;
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (method !== "GET" && method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const bodyText = await request.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        fetchOptions.body = formData;
        // Let fetch set boundary header automatically
        delete headers["content-type"];
      } else {
        const rawBody = await request.arrayBuffer();
        if (rawBody.byteLength > 0) {
          fetchOptions.body = rawBody;
        }
      }
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      // Don't forward content-encoding or transfer-encoding to avoid issues with Next.js compression
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await backendResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Proxy request failed";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to communicate with backend service",
        error: message,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleProxyRequest(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleProxyRequest(request, context, "POST");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleProxyRequest(request, context, "PUT");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleProxyRequest(request, context, "PATCH");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleProxyRequest(request, context, "DELETE");
}
