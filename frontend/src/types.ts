import type { LucideIcon } from "lucide-react";

export type Turn = {
  role: "player" | "narrator";
  content: string;
};

export type SidebarAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isPressed?: boolean;
  onClick: () => void;
};
