export interface ActivityEvent {
  id: string;
  entityType: "vehicle" | "driver" | "assignment" | "system";
  entityId?: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}
