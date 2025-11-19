import React from "react";

interface IButtonProps {
  readonly text: string;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

const Secondary = ({ text, disabled, onClick }: IButtonProps) => (
  <button
    className="px-4 py-2.5 cursor-pointer border-1 border-black-900 disabled:opacity-70 rounded-md bg-black-100 text-black-100"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {text}
  </button>
);

export default Secondary;
