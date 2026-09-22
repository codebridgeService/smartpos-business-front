import { redirect } from "next/navigation";

export default async function PosTerminalRedirect({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = new URLSearchParams();

  if (resolvedParams) {
    Object.entries(resolvedParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        query.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      }
    });
  }

  const queryString = query.toString();
  redirect(`/pos${queryString ? `?${queryString}` : ""}`);
}
