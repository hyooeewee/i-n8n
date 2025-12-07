"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useSuspenseExecution } from "../hooks/use-executions";

const executionLogos: Record<ExecutionStatus, React.ReactNode> = {
  [ExecutionStatus.RUNNING]: (
    <Loader2Icon className="size-5 text-blue-600 animate-spin" />
  ),
  [ExecutionStatus.FAILED]: <XCircleIcon className="size-5 text-red-600" />,
  [ExecutionStatus.SUCCESS]: (
    <CheckCircle2Icon className="size-5 text-green-600" />
  ),
};

export const ExecutionView = ({ id }: { id: string }) => {
  const { data } = useSuspenseExecution(id);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const calcDuration = (start: Date | null, end: Date | null) => {
    if (!start || !end) return null;
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 1000
    );
  };

  const upperFirstChar = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {executionLogos[data.status] || (
            <ClockIcon className="size-5 text-muted-foreground" />
          )}
          <div>
            <CardTitle>{upperFirstChar(data.status)}</CardTitle>
            <CardDescription>
              Execution for {data.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              prefetch
              href={`/workflows/${data.workflow.id}`}
              className="text-sm hover:underline text-primary"
            >
              {data.workflow.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{upperFirstChar(data.status)}</p>
          </div>{" "}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            </p>
          </div>
          {data.completedAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(data.completedAt, { addSuffix: true })}
              </p>
            </div>
          )}
          {calcDuration(data.startedAt, data.completedAt) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">
                {`${calcDuration(data.startedAt, data.completedAt)} s`}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Event ID
            </p>
            <p className="text-sm">{data.inngestEventId}</p>
          </div>
        </div>
        {data.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium text-red-900 mb-2">Error</p>
              <p className="text-sm text-red-800 font-mono">{data.error}</p>
            </div>
            {data.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-900 hover:bg-red-100"
                  >
                    {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-sm font-mono text-red-800 overflow-auto mt-2 p-2 bg-red-100 rounded">
                    {data.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
        {data.output && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Output</p>
            <p className="text-xs font-mono overflow-auto">
              {JSON.stringify(data.output, null, 2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
