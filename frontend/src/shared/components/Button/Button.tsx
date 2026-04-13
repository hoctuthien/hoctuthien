import React from 'react';
import './button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  label,
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  onClick,
  type = 'button',
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const classNames = [
    'htt-btn',
    `htt-btn--${variant}`,
    `htt-btn--${size}`,
    fullWidth ? 'htt-btn--full' : '',
    isDisabled ? 'htt-btn--disabled' : '',
    loading ? 'htt-btn--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {loading && (
        <span className="htt-btn__spinner" aria-hidden="true" />
      )}
      {!loading && iconLeft && (
        <span className="htt-btn__icon htt-btn__icon--left">{iconLeft}</span>
      )}
      <span className="htt-btn__label">{label}</span>
      {!loading && iconRight && (
        <span className="htt-btn__icon htt-btn__icon--right">{iconRight}</span>
      )}
    </button>
  );
};