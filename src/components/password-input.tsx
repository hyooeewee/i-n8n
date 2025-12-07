"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type={visible ? "text" : "password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          onClick={() => setVisible((v) => !v)}
          variant="link"
          className="text-muted-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <Eye /> : <EyeOff />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
