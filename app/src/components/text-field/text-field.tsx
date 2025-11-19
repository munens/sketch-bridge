import React from "react";
import classNames from "classnames";

interface ITextFieldProps {
  readonly placeholder?: string;
  readonly label?: string;
  readonly onChange?: (value: string) => void;
  readonly onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly type: string;
  readonly value: string;
  readonly className?: string;
}

const TextField = ({
  type,
  value,
  label,
  placeholder,
  onChange,
  onKeyDown,
  className,
}: ITextFieldProps) => (
  <div className={classNames("mb-4", className)}>
    <label htmlFor="text-field">{label}</label>
    <input
      className="mt-1 py-1 px-3 rounded-md w-full text-base border border-black-900"
      id="text-field"
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  </div>
);

export default TextField;
