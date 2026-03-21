/**
 * Custom React hooks for the Umbra web app.
 * Each hook abstracts a common data-fetching or UI pattern.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// ─── useDebounce ──────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof newValue === "function" ? (newValue as (p: T) => T)(prev) : newValue;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(next));
      }
      return next;
    });
  }, [key]);

  return [value, set] as const;
}

// ─── useFetch ─────────────────────────────────────────────────────────────────

export type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export function useFetch<T>(url: string | null) {
  const [state, setState] = useState<FetchState<T>>({ status: "idle" });

  useEffect(() => {
    if (!url) return;
    setState({ status: "loading" });

    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setState({ status: "success", data: data.data ?? data });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error", error: err.message });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// ─── useSubmissionForm ────────────────────────────────────────────────────────

/**
 * Hook for the public intake form submission flow.
 */
export function useSubmissionForm(agentId: string, organizationId: string) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function updateField(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  }

  function validate(requiredFields: string[]): boolean {
    const newErrors: Record<string, string> = {};
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        newErrors[field] = "This field is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(requiredFields: string[] = []) {
    if (!validate(requiredFields)) return false;
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, organizationId, formData }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Submission failed");

      setIsSuccess(true);
      return true;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { formData, errors, isLoading, isSuccess, serverError, updateField, submit };
}

// ─── useLeadFilters ───────────────────────────────────────────────────────────

export interface LeadFilters {
  status: string;
  agentId: string;
  assignedTo: string;
  search: string;
  page: number;
}

export function useLeadFilters(defaults?: Partial<LeadFilters>) {
  const [filters, setFilters] = useState<LeadFilters>({
    status: "",
    agentId: "",
    assignedTo: "",
    search: "",
    page: 1,
    ...defaults,
  });

  function setFilter<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== "page" ? 1 : (value as number) }));
  }

  function reset() {
    setFilters({ status: "", agentId: "", assignedTo: "", search: "", page: 1 });
  }

  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== 1).map(([k, v]) => [k, String(v)])
    )
  ).toString();

  return { filters, setFilter, reset, queryString };
}
