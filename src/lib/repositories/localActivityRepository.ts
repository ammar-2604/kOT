import { ActivityRepository } from "./interfaces";
import { ActivityEvent } from "../types";
import { storageManager } from "./storageManager";

export class LocalActivityRepository implements ActivityRepository {
  async getAll(): Promise<ActivityEvent[]> {
    const list = storageManager.getActivities();
    return [...list].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getByEntity(entityType: string, entityId: string): Promise<ActivityEvent[]> {
    const list = storageManager.getActivities();
    return list
      .filter((a) => a.entityType === entityType && a.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async add(event: Omit<ActivityEvent, "id">): Promise<ActivityEvent> {
    const list = storageManager.getActivities();
    const id = `act-${Date.now()}`;
    const newEvent: ActivityEvent = {
      ...event,
      id,
    };
    list.unshift(newEvent);
    storageManager.saveActivities(list);
    return newEvent;
  }
}

export const activityRepository = new LocalActivityRepository();
