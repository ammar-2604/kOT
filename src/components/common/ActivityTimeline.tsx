import React from "react";
import { ActivityEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils/dateUtils";

interface ActivityTimelineProps {
  activities: ActivityEvent[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-gray-500">
        No recorded activity events.
      </div>
    );
  }

  return (
    <div className="border border-gray-300 bg-white overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
          <tr>
            <th className="py-2 px-3 whitespace-nowrap">Timestamp</th>
            <th className="py-2 px-3">Event</th>
            <th className="py-2 px-3">Details</th>
            <th className="py-2 px-3 whitespace-nowrap">Operator</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-900">
          {activities.map((event, eventIdx) => (
            <tr key={event.id || eventIdx} className="hover:bg-gray-50">
              <td className="py-2 px-3 whitespace-nowrap text-gray-500 font-mono">
                {formatDate(event.timestamp)}
              </td>
              <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">
                {event.title}
              </td>
              <td className="py-2 px-3 text-gray-700 leading-normal">
                {event.description}
              </td>
              <td className="py-2 px-3 whitespace-nowrap text-gray-500">
                {event.actor || "System"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
