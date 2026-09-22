import { redirect } from "next/navigation";

export default async function BusinessPosRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const outlet = params?.outlet;
  if (outlet) {
    redirect(`/pos?outlet=${Array.isArray(outlet) ? outlet[0] : outlet}`);
  }
  redirect("/pos");
}
