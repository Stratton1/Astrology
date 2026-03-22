import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}) => {
  const baseClass = "cosmos-btn";
  const variantClass = `cosmos-btn--${variant}`;
  const loadingClass = loading ? "cosmos-btn--loading" : "";

  return (
    <button
      className={[baseClass, variantClass, loadingClass, className]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled ?? loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span className="cosmos-btn__spinner" aria-hidden="true" />
      ) : null}
      <span className={loading ? "cosmos-btn__label--hidden" : undefined}>
        {children}
      </span>
    </button>
  );
};

Button.displayName = "Button";
