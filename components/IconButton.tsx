import type { LucideIcon } from "lucide-react";

type IconButtonProps = {
  icon: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
};

export default function IconButton({ icon: Icon, selected, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-12 h-12 rounded-md transition-all duration-200"
      style={
        selected
          ? {
              background: "rgba(74, 131, 148, 1)",
              boxShadow: "0px 2px 8px rgba(59, 59, 59, 0.25)",
            }
          : {
              background: "white",
            }
      }
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = "rgba(74, 131, 148, 0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = "white";
        }
      }}
    >
      <Icon className="w-5 h-5" color={selected ? "white" : "rgba(74, 131, 148, 1)"} />
    </button>
  );
}
