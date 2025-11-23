import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

const ExecuteWorkflowButton = ({ id }: { id: string }) => {
  const executeWorkflow = useExecuteWorkflow();
  
  // TODO: Call handleSave function before executing workflow if workflow is unsaved
  const handleExecute = () => executeWorkflow.mutate({ id });

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
};

export default ExecuteWorkflowButton;
