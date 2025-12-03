"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const AVAILABLE_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
  "gemini-pro",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message:
        "Invalid variable name, variable name must start with a letter or underscore and container only letters, numbers, and underscores",
    }),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type GeminiValues = z.infer<typeof formSchema>;

interface props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GeminiValues>;
}

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: props) => {
  const form = useForm<GeminiValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName || "",
      model: defaultValues?.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues?.systemPrompt || "",
      userPrompt: defaultValues?.userPrompt || "",
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchVariableName = form.watch("variableName") || "myGemini";
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };
  // Reset form when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName || "",
        model: defaultValues?.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues?.systemPrompt || "",
        userPrompt: defaultValues?.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gemini Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompts for this node.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="myGemini"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {`Use this name to reference the response in other nodes: {{ ${watchVariableName}.aiResponse.text }}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem
                          key={model}
                          value={model}
                        >
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The Google Gemini model to use for completion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] font-mono text-sm"
                      placeholder="You are a helpful assistant."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {
                      "Set the behavior of the assistant. Use {{ variables }} for simple values or {{ json variable }} to stringify objects."
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] font-mono text-sm"
                      placeholder="Summarize this text: {{ json httpResponse.text }}"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {
                      "The prompt to send to the AI. Use {{ variables }} for simple values or {{ json variable }} to stringify objects."
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
