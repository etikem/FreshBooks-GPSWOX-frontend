import { redirect } from 'next/navigation';

export default async function LegacyClientRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/clients?id=${encodeURIComponent(id)}`);
}
