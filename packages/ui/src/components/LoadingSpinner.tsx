import React from "react";

export type SpinnerSize = "sm" | "md" | "lg" | number;

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const SIZE_MAP: Record<string, number> = {
  sm: 16,
  md: 32,
  lg: 48,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label = "Loading…",
  className = "",
}) => {
  const px = typeof size === "number" ? size : (SIZE_MAP[size] ?? 32);

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={["cosmos-spinner", className].filter(Boolean).join(" ")}
      role="status"
      aria-label={label}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        className="cosmos-spinner__track"
      />
    </svg>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";
