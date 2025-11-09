import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  await requireAuth();
  return <div>Execution ID: {id}</div>;
};

export default Page;
