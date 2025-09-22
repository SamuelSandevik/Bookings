"use client";

import { AuthProvider } from "@/context/AuthContext";
import { SlotProvider } from "@/context/SlotContext";
import { BookableProvider } from "@/context/BookableContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SlotProvider>
        <BookableProvider>{children}</BookableProvider>
      </SlotProvider>
    </AuthProvider>
  );
}
