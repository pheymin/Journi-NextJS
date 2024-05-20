"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ToastNotifierProps {
  message: string;
  shouldReload: boolean;
}

const ToastNotifier: React.FC<ToastNotifierProps> = ({ message, shouldReload }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (message) {
      toast({
        title: message.includes("Error") ? "Error" : "Success",
        description: message,
        variant: message.includes("Error") ? "destructive" : "default",
      });

      if (shouldReload) {
        // Delay the reload to ensure the toast is displayed first
        setTimeout(() => {
          window.location.href = window.location.pathname;
        }, 1000);
      }
    }
  }, [message, shouldReload, toast]);

  return null;
};

export default ToastNotifier;