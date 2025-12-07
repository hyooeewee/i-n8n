import { CredentialView } from "@/features/credentials/components/credential";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { id } = await params;
  prefetchCredential(id);
  return <CredentialView id={id} />;
};

export default Page;
