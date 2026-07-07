"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  severity: string;
  risk_score: number;
  indicator: string;
  channel: string;
  status: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function loadNotifications() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/alerts/notifications?unread_only=true&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`${API_BASE_URL}/alerts/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border px-4 py-2"
      >
        <Bell size={20} />

        {notifications.length > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full px-2 text-xs">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 rounded-xl border p-4 shadow-lg bg-surface border-white/10">
          <h3 className="mb-3 text-lg font-semibold text-white">Threat Alerts</h3>

          {notifications.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No unread alerts</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-lg border p-3 text-sm border-white/5 bg-white/5"
                >
                  <div className="font-semibold text-white">{notification.title}</div>

                  <div className="mt-1 text-on-surface-variant">
                    IOC: {notification.indicator}
                  </div>

                  <div className="text-on-surface-variant">
                    Risk Score: {notification.risk_score}/100
                  </div>

                  <div className="text-on-surface-variant">
                    Severity: {notification.severity}
                  </div>

                  <div className="text-on-surface-variant">
                    Channel: {notification.channel}
                  </div>

                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="mt-3 rounded-lg border px-3 py-1 text-xs border-white/10 hover:bg-white/10 text-white"
                  >
                    Mark as Read
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
