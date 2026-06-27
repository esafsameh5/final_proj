import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";
import api from "../../utils/api";

function PatientNotifications({ patients, showToast, refreshNotifications, hasUnread, unreadCount }) {
  const patientId = sessionStorage.getItem("userId") || "H-2026-001";
  const patient = patients ? (patients[patientId] || patients["H-2026-001"]) : null;

  // Local state for self-contained notifications view
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/api/v1/notifications/my", {
        params: {
          Search: activeSearch || undefined,
          Page: page,
          PageSize: pageSize
        }
      });
      if (res.data && res.data.success && res.data.data) {
        const items = res.data.data.items || res.data.data || [];
        setNotifications(items);
        setTotalCount(res.data.data.totalCount || items.length);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load notifications locally:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const handleMarkAsRead = async (id) => {
    // 1. Optimistic Update: immediately mark as read locally
    const previousNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((notif) => (notif.notificationId === id || notif.id === id ? { ...notif, isRead: true } : notif))
    );

    // Synchronize parent state/badges optimistically
    if (refreshNotifications) {
      refreshNotifications();
    }

    try {
      // 2. Perform background PATCH request
      const res = await api.patch(`/api/v1/notifications/${id}/read`);
      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || "Failed to mark notification as read");
      }
      showToast?.("تم تحديث حالة الإشعار بنجاح.", "success");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      showToast?.("فشل في تحديث الإشعار. يرجى إعادة المحاولة.", "danger");

      // 3. Rollback on failure
      setNotifications(previousNotifications);
      if (refreshNotifications) {
        refreshNotifications();
      }
    }
  };

  const formatArabicDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const getStyleForNotification = (notif) => {
    const priority = String(notif.priority || "").toLowerCase();
    const type = String(notif.type || "").toLowerCase();

    let icon = "🔔";
    let color = "var(--primary)";
    let border = "1.5px solid var(--border-color)";
    let background = "white";

    if (priority === "critical" || type === "emergencyalert" || type === "securityalert") {
      icon = "🚨";
      color = "var(--accent-red)";
      border = "1.5px solid rgba(239, 68, 68, 0.3)";
      background = "rgba(239, 68, 68, 0.03)";
    } else if (priority === "high" || type === "medicationreminder") {
      icon = "⚠️";
      color = "var(--accent-amber)";
      border = "1.5px solid rgba(245, 158, 11, 0.3)";
      background = "rgba(245, 158, 11, 0.03)";
    } else if (type === "labresultready") {
      icon = "🧪";
      color = "var(--primary)";
      background = "var(--primary-glow)";
      border = "1.5px solid rgba(13, 110, 253, 0.15)";
    } else if (type === "radiologyresultready") {
      icon = "🩻";
      color = "var(--primary)";
      background = "var(--primary-glow)";
      border = "1.5px solid rgba(13, 110, 253, 0.15)";
    } else if (type === "appointment") {
      icon = "📅";
      color = "var(--primary)";
    }

    return { icon, color, border, background };
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (!patient) {
    return (
      <div id="patientNotificationsPage" className="page-content active" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <p>لم يتم العثور على بيانات المريض.</p>
      </div>
    );
  }

  return (
    <div id="patientNotificationsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🔔 مركز الإشعارات والتنبيهات</h2>
          <p>تابع التحديثات والأنشطة الطبية الموثقة مؤخراً في ملفك الموحد</p>
        </div>
        <HeaderUserBadge name={patient.name} badgeCount={unreadCount} hasUnread={hasUnread} />
      </div>

      <div className="box" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Search controls */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", width: "100%" }}>
          <input
            type="text"
            placeholder="البحث في الإشعارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "1.5px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px"
            }}
          />
          <button type="submit" className="btn" style={{ padding: "10px 24px", fontWeight: "bold" }}>
            بحث
          </button>
          {activeSearch && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setActiveSearch("");
                setPage(1);
              }}
              style={{
                padding: "10px 16px",
                background: "var(--bg-main)",
                color: "var(--text-dark)",
                border: "1.5px solid var(--border-color)"
              }}
            >
              إلغاء التصفية
            </button>
          )}
        </form>

        <h2>الإشعارات الأخيرة</h2>

        {/* Loading state */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "20px 0" }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: "80px",
                  borderRadius: "var(--radius-sm)",
                  background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite linear"
                }}
              />
            ))}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>
        ) : error ? (
          /* Error state */
          <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed var(--accent-red)", borderRadius: "var(--radius-lg)", background: "rgba(239, 68, 68, 0.02)" }}>
            <span style={{ fontSize: "40px" }}>⚠️</span>
            <h3 style={{ marginTop: "12px", color: "var(--accent-red)", fontWeight: "700" }}>فشل تحميل الإشعارات</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "8px 0 16px 0" }}>حدث خطأ أثناء محاولة الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.</p>
            <button type="button" className="btn" onClick={fetchNotifications} style={{ fontWeight: "bold" }}>
              🔄 إعادة المحاولة
            </button>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div style={{ padding: "60px 40px", textAlign: "center", border: "1.5px dashed var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--bg-main)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              fontSize: "36px"
            }}>
              🔕
            </div>
            <h3 style={{ fontWeight: "700", color: "var(--text-dark)" }}>لا توجد إشعارات حالية</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>
              {activeSearch ? "لا توجد نتائج تطابق بحثك الحالي." : "ملفك نظيف ولا توجد تنبيهات معلقة حالياً."}
            </p>
          </div>
        ) : (
          /* Notifications list */
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((notif) => {
              const { icon, color, border, background } = getStyleForNotification(notif);
              const notifId = notif.notificationId || notif.id;

              return (
                <div
                  key={notifId}
                  style={{
                    display: "flex",
                    gap: "15px",
                    padding: "16px 20px",
                    borderRadius: "var(--radius-sm)",
                    border,
                    background: notif.isRead ? "white" : background,
                    alignItems: "center",
                    transition: "all 0.2s ease",
                    boxShadow: notif.isRead ? "none" : "var(--shadow-sm)",
                    position: "relative"
                  }}
                >
                  {/* Unread indicator bar */}
                  {!notif.isRead && (
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      background: color,
                      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0"
                    }} />
                  )}

                  <span style={{ fontSize: "26px" }}>{icon}</span>
                  
                  <div style={{ flex: "1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h4 style={{ margin: "0 0 2px 0", fontSize: "14.5px", fontWeight: "700", color: notif.isRead ? "var(--text-dark)" : color }}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span style={{
                          fontSize: "10.5px",
                          background: color,
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontWeight: "bold"
                        }}>
                          جديد
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "0", fontSize: "13px", color: notif.isRead ? "var(--text-muted)" : "var(--text-dark)" }}>
                      {notif.body}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "Outfit" }}>
                      {formatArabicDate(notif.createdAt)}
                    </span>
                    {!notif.isRead && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleMarkAsRead(notifId)}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          background: "var(--bg-main)",
                          color: "var(--text-dark)",
                          border: "1.5px solid var(--border-color)",
                          borderRadius: "6px"
                        }}
                      >
                        ✔ تحديد كمقروء
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "20px",
            borderTop: "1.5px solid var(--bg-main)",
            paddingTop: "20px"
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: "8px 16px",
                background: "var(--bg-main)",
                color: "var(--text-dark)",
                border: "1.5px solid var(--border-color)",
                opacity: page === 1 ? 0.5 : 1,
                cursor: page === 1 ? "not-allowed" : "pointer"
              }}
            >
              السابق
            </button>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>
              صفحة <span style={{ fontFamily: "Outfit" }}>{page}</span> من <span style={{ fontFamily: "Outfit" }}>{totalPages}</span>
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                padding: "8px 16px",
                background: "var(--bg-main)",
                color: "var(--text-dark)",
                border: "1.5px solid var(--border-color)",
                opacity: page === totalPages ? 0.5 : 1,
                cursor: page === totalPages ? "not-allowed" : "pointer"
              }}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientNotifications;
