import React from "react";

export interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  retryLabel = "Try again",
  className = "",
}) => {
  return (
    <div
      className={["cosmos-error", className].filter(Boolean).join(" ")}
      role="alert"
      aria-live="assertive"
    >
      <span className="cosmos-error__message">{message}</span>
      {onRetry !== undefined ? (
        <button
          type="button"
          className="cosmos-error__retry"
          onClick={onRetry}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
};

ErrorDisplay.displayName = "ErrorDisplay";
