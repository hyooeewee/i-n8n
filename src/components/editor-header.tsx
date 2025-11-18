"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { editorAtom } from "@/features/editor/store/atoms";
import {
  useSuspenseWorkflow,
  useUpdateWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflows";
import { useAtomValue } from "jotai";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const EditorNameInput = ({ id }: { id: string }) => {
  const { data } = useSuspenseWorkflow(id);
  const updateWorkflow = useUpdateWorkflowName();
  const [name, setName] = useState(data.name);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  useEffect(() => {
    if (data.name) setName(data.name);
  }, [data.name]);
  const handleSave = async () => {
    if (name === data.name) return setIsEditing(false);
    try {
      await updateWorkflow.mutateAsync({ id, name });
    } catch {
      toast.error("Failed to update workflow name");
      setName(data.name);
    } finally {
      setIsEditing(false);
    }
  };
  const handleKeydown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") return handleSave();
    if (e.key === "Escape") {
      setIsEditing(false);
      setName(data.name);
    }
  };
  if (isEditing) {
    return (
      <Input
        className="h-7 w-auto min-w-[100px] px-2"
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={updateWorkflow.isPending}
        onKeyDown={handleKeydown}
        onBlur={handleSave}
      />
    );
  }
  return (
    <BreadcrumbItem
      className="cursor-pointer hover:text-foreground transition-colors"
      onClick={() => setIsEditing(true)}
    >
      {data.name}
    </BreadcrumbItem>
  );
};

export const EditorBreadcrumbs = ({ id }: { id: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/workflows"
              prefetch
            >
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput id={id} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const EditorSaveButton = ({ id }: { id: string }) => {
  const editor = useAtomValue(editorAtom);
  const updateWorkflow = useUpdateWorkflow();
  const handleSave = () => {
    if (!editor) return;
    const nodes = editor.getNodes();
    const edges = editor.getEdges();
    updateWorkflow.mutate({
      id,
      nodes,
      edges,
    });
  };

  return (
    <div className="ml-auto">
      <Button
        size="sm"
        onClick={handleSave}
        disabled={updateWorkflow.isPending}
      >
        <SaveIcon className="size-4" />
        Save
      </Button>
    </div>
  );
};

const EditorHeader = ({ id }: { id: string }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <EditorBreadcrumbs id={id} />
        <EditorSaveButton id={id} />
      </div>
    </header>
  );
};

export default EditorHeader;
