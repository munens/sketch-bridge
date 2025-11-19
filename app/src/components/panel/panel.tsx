import React, { ReactNode } from "react";
import classNames from "classnames";

type Background =
  | " bg-black-100"
  | " bg-black-200"
  | " bg-black-300"
  | " bg-black-400"
  | " bg-black-500"
  | " bg-black-600"
  | " bg-black-700"
  | " bg-black-800"
  | " bg-black-900";

interface IPanelProps {
  children: ReactNode;
  backgroundColor?: Background;
  className?: string;
}

const Panel = ({
  children,
  backgroundColor = "bg-black-700",
  className,
}: IPanelProps) => (
  <div
    className={classNames(
      "relative p-5 rounded-md",
      backgroundColor,
      className,
    )}
  >
    {children}
  </div>
);

export default Panel;
