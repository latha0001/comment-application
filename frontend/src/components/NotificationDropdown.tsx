"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "react-query"
import { formatDistanceToNow } from "date-fns"
import axios from "axios"

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifications, refetch } = useQuery(
    "notifications",
    () => axios.get("/api/notifications").then((res) => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  )

  const { data: unreadCount } = useQuery(
    "unread-count",
    () => axios.get("/api/notifications/unread-count").then((res) => res.data),
    {
      refetchInterval: 30000,
    },
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`)
      refetch()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read")
      refetch()
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  return (
    <div className="notifications" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="btn btn-secondary" style={{ position: "relative" }}>
        🔔{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px" }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-small">
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications && notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatDistanceToNow(new Date(notification.createdAt))} ago</div>
                </div>
              ))
            ) : (
              <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
