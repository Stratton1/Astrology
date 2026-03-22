import React from "react";

export interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  children,
  className = "",
}) => {
  return (
    <div className={["cosmos-card", className].filter(Boolean).join(" ")}>
      {header !== undefined ? (
        <div className="cosmos-card__header">{header}</div>
      ) : null}
      <div className="cosmos-card__body">{children}</div>
      {footer !== undefined ? (
        <div className="cosmos-card__footer">{footer}</div>
      ) : null}
    </div>
  );
};

Card.displayName = "Card";
