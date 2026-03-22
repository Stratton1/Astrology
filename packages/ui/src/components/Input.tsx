import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const describedBy = [
      error && errorId,
      helperText && !error && helperId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="cosmos-input__wrapper">
        {label !== undefined ? (
          <label htmlFor={inputId} className="cosmos-input__label">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={[
            "cosmos-input",
            error ? "cosmos-input--error" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-describedby={describedBy}
          aria-invalid={error !== undefined ? true : undefined}
          {...rest}
        />
        {error !== undefined ? (
          <span id={errorId} className="cosmos-input__error" role="alert">
            {error}
          </span>
        ) : null}
        {helperText !== undefined && error === undefined ? (
          <span id={helperId} className="cosmos-input__helper">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
