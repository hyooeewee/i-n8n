import { CredentialView } from "@/features/credentials/components/credential";
import {
  CredentialsError,
  CredentialsLoading,
} from "@/features/credentials/components/credentials";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { id } = await params;
  prefetchCredential(id);
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full h-full flex flex-col gap-y-8">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialsError />}>
            <Suspense fallback={<CredentialsLoading />}>
              <CredentialView id={id} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
