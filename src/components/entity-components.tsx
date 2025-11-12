import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

type EntityContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
};

type EntitySearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type EntityPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button
          size="sm"
          disabled={disabled || isCreating}
          onClick={onNew}
        >
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Button>
      )}
      {!onNew && newButtonHref && (
        <Button
          size="sm"
          asChild
        >
          <Link
            href={newButtonHref}
            prefetch
          >
            <PlusIcon className="size-4" />
            {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

export const EntityContainer = ({
  children,
  header,
  search,
  pagination,
}: EntityContainerProps) => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="flex flex-col mx-auto max-w-7xl gap-y-8 size-full">
        {header}

        <div className="flex flex-col gap-y-4 h-full">
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  );
};

export const EntitySearch = ({
  value,
  onChange,
  placeholder,
}: EntitySearchProps) => {
  return (
    <div className="relative ml-auto">
      <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="max-w-[200px] bg-background shadow-none border-border pl-8"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}: EntityPaginationProps) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {totalPages || 1}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || disabled}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
