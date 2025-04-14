export enum CancelFlowStep {
  NONE,
  CONFIRM,
  TASK_COMPLETE, // Did you finish your task?
  RATE_FOCUS, // For deep work rating
  RATE_REST, // For deep rest rating
  REFLECT,
  SESSION_COMPLETE,
}

export const distractionReasonIcons = [
  {
    label: "SOCIAL MEDIA / PHONE",
    icon: "mobile" as const,
  },
  {
    label: "EXTERNAL DISTRACTIONS",
    icon: "volume-up" as const,
  },
  {
    label: "LOW ENERGY",
    icon: "battery-quarter" as const,
  },
  { label: "CHANGE IN PRIORITIES", icon: "exchange" as const },
  { label: "NONE", icon: "check" as const },
];

export const restActivitiesIcons = [
  { id: "MOVEMENT", icon: "arrow-right" as const },
  { id: "REFUEL", icon: "coffee" as const },
  { id: "SOCIALIZING", icon: "users" as const },
  { id: "MINDFULNESS", icon: "heart" as const },
  { id: "SOCIAL MEDIA", icon: "mobile" as const },
];
