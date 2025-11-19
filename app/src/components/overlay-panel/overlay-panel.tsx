import { ReactNode } from "react";
import classNames from "classnames";

type OpacityLevel = "low" | "medium" | "high";

interface IOverlayPanelProps {
  children: ReactNode;
  opacity?: OpacityLevel;
  rounded?: boolean;
  className?: string;
}

const OverlayPanel = ({
  children,
  opacity = "high",
  rounded = true,
  className,
}: IOverlayPanelProps) => {
  // MapDashboard opacity levels to Tailwind classes
  const opacityClasses: Record<OpacityLevel, string> = {
    low: "bg-black-800/50", // 50% opacity
    medium: "bg-black-800/75", // 75% opacity
    high: "bg-black-800/90", // 90% opacity
  };

  return (
    <div
      className={classNames(
        "shadow-lg h-full overflow-hidden",
        opacityClasses[opacity],
        {
          "rounded-lg": rounded,
        },
        className,
      )}
    >
      {children}
    </div>
  );
};

export default OverlayPanel;
