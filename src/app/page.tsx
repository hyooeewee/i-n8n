"use client";

import LogoutButton from "@/app/logout-button";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const queryClient = useQueryClient();
  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow created");
      },
    })
  );
  const testAI = useMutation(
    trpc.testAI.mutationOptions({
      onSuccess: () => {
        toast.success("AI Job Queued");
      },
    })
  );
  return (
    <div className="min-w-full min-h-screen flex flex-col items-center justify-center gap-y-6">
      Protected server component
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        Create Workflow
      </Button>
      <LogoutButton />
      <Button
        disabled={testAI.isPending}
        onClick={() => testAI.mutate()}
      >
        Test AI
      </Button>
    </div>
  );
};

export default Page;
