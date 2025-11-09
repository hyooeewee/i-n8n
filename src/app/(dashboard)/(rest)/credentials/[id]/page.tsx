import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { id } = await params;
  return <div>Credential ID: {id}</div>;
};

export default Page;
