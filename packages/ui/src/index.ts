/**
 * @package @umbra/ui
 *
 * Shared React component library.
 * All components use Tailwind and accept className overrides.
 * No runtime CSS-in-JS — pure Tailwind utility classes.
 */

import React from "react";

// ─── UTILITY ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "default" | "new" | "reviewing" | "quoted"
  | "accepted" | "declined" | "closed" | "success" | "warning" | "error";

const badgeVariants: Record<BadgeVariant, string> = {
  default:   "bg-slate-100 text-slate-600",
  new:       "bg-blue-50 text-blue-700",
  reviewing: "bg-amber-50 text-amber-700",
  quoted:    "bg-violet-50 text-violet-700",
  accepted:  "bg-emerald-50 text-emerald-700",
  declined:  "bg-red-50 text-red-700",
  closed:    "bg-slate-100 text-slate-600",
  success:   "bg-emerald-50 text-emerald-700",
  warning:   "bg-amber-50 text-amber-700",
  error:     "bg-red-50 text-red-700",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize    = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:   "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  ghost:     "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm",
          "placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors",
          error
            ? "border-red-300 focus:ring-red-200 focus:border-red-400"
            : "border-slate-200 focus:ring-brand-500/30 focus:border-brand-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── SELECT ───────────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm",
          "focus:outline-none focus:ring-2 transition-colors appearance-none",
          error
            ? "border-red-300 focus:ring-red-200"
            : "border-slate-200 focus:ring-brand-500/30 focus:border-brand-500",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const cardPadding = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ hoverable, padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-card",
        hoverable && "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
}

export function StatCard({ label, value, delta, deltaUp, icon, iconBg = "bg-brand-50" }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
            {icon}
          </div>
        )}
        {delta !== undefined && (
          <span className={cn("text-xs font-medium", deltaUp ? "text-emerald-600" : "text-red-500")}>
            {delta}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-0.5">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </Card>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  src?: string;
  className?: string;
}

const avatarSizes = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" };

export function Avatar({ name, size = "md", src, className }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", avatarSizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold",
        avatarSizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────

export interface SpinnerProps { size?: "sm" | "md" | "lg"; className?: string }
const spinnerSizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "border-2 border-current/20 border-t-current rounded-full animate-spin",
        spinnerSizes[size],
        className
      )}
    />
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <div className={cn("border-t border-slate-100", className)} />;
}

// ─── TOOLTIP (simple CSS-based) ───────────────────────────────────────────────

export interface TooltipProps { children: React.ReactNode; content: string }

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ─── SCORE BAR ────────────────────────────────────────────────────────────────

export interface ScoreBarProps { score: number; showLabel?: boolean }

export function ScoreBar({ score, showLabel = true }: ScoreBarProps) {
  const color =
    score >= 80 ? "bg-emerald-500" :
    score >= 60 ? "bg-amber-400" :
    "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-600">{score}</span>}
    </div>
  );
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export { cn };
