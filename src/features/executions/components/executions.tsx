"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import type { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import React from "react";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";

const executionLogos: Record<ExecutionStatus, React.ReactNode> = {
  [ExecutionStatus.RUNNING]: (
    <Loader2Icon className="size-5 text-blue-600 animate-spin" />
  ),
  [ExecutionStatus.FAILED]: <XCircleIcon className="size-5 text-red-600" />,
  [ExecutionStatus.SUCCESS]: (
    <CheckCircle2Icon className="size-5 text-green-600" />
  ),
};

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();
  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionsItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};
export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history."
    />
  );
};

export const ExecutionsPagination = () => {
  const { data, isFetching } = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  return (
    <EntityPagination
      page={data.page}
      totalPages={data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
      disabled={isFetching}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="You haven't created any executions yet. Get started by running your first workflow." />
  );
};

export const ExecutionsItem = ({
  data,
}: {
  data: Execution & { workflow: { id: string; name: string } };
}) => {
  const calcDuration = (start: Date | null, end: Date | null) => {
    if (!start || !end) return null;
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 1000
    );
  };
  const duration = calcDuration(data.startedAt, data.completedAt);
  const subtitle = (
    <>
      {`${data.workflow.name} · 
      Started ${formatDistanceToNow(data.startedAt, { addSuffix: true })}
      ${duration ? ` · Took ${duration}s` : ""}`}
    </>
  );

  const upperFirstChar = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={upperFirstChar(data.status)}
      subtitle={subtitle}
      image={
        <div className="flex items-center justify-center size-8">
          {executionLogos[data.status] || (
            <ClockIcon className="size-5 text-muted-foreground" />
          )}
        </div>
      }
    />
  );
};
