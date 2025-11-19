import React from "react";

interface IButtonProps {
  readonly text: string;
  readonly disabled?: boolean;
  readonly type: "submit" | "reset" | "button" | undefined;
  readonly onClick: () => void;
}

const Primary = ({ text, type, disabled, onClick }: IButtonProps) => (
  <button
    className="px-5 py-2 cursor-pointer border-0 disabled:opacity-70 rounded-md bg-black-900 text-black-100"
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {text}
  </button>
);

export default Primary;
