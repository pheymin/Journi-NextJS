"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { ReloadIcon } from "@radix-ui/react-icons"

type Props = ComponentProps<"button"> & {
  pendingText?: string;
};

export function SubmitButton({ children, pendingText, ...props }: Props) {
  const { pending, action } = useFormStatus();
  const isPending = pending && action === props.formAction;
  return (
    <button {...props} type="submit" aria-disabled={pending}>
      {isPending ? <div className="flex flex-row justify-center items-center"><ReloadIcon className="mr-2 h-4 w-4 animate-spin" />{pendingText}</div> : children}
    </button>
  );
}
