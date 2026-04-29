"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CreateModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CreateModalContext = createContext<CreateModalContextValue | null>(null);

export function CreateModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CreateModalContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CreateModalContext.Provider>
  );
}

export function useCreateModal() {
  const ctx = useContext(CreateModalContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
    };
  }
  return ctx;
}
