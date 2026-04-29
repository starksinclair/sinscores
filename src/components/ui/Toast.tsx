"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div className="fixed bottom-24 left-4 right-4 z-[100] mx-auto max-w-phone bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-center text-sm animate-in fade-in slide-in-from-bottom-2">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? { show: () => {} };
}
