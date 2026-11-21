"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export type ToastVariant = "success" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface Toast extends ToastOptions {
  id: number;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => [
        ...current,
        { ...options, id, variant: options.variant ?? "success" },
      ]);
      timers.current.push(setTimeout(() => dismiss(id), 6000));
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-8"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-card p-4 shadow-[0_18px_60px_rgba(48,39,42,0.16)] ${
              toast.variant === "error"
                ? "border-error/30"
                : "border-success/30"
            }`}
          >
            {toast.variant === "error" ? (
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-error" />
            ) : (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-success" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-1 text-xs leading-5 text-muted">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-full p-1 text-muted transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
