import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaBuildingCircleCheck,
  FaChartColumn,
  FaCreditCard,
  FaHospital,
  FaRotate,
  FaUserDoctor,
  FaUserGroup,
} from "react-icons/fa6";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import MinistryDataState from "../../components/ministry/MinistryDataState";
import MinistryPageHeader from "../../components/ministry/MinistryPageHeader";
import MinistryStatCard from "../../components/ministry/MinistryStatCard";
import {
  buildDisplayLines,
  fetchMinistryDashboardData,
  fetchMinistryNotifications,
  formatApiError,
  generatePatientSmartCard,
  markMinistryNotificationAsRead,
  redeemSmartCardToken,
} from "../../services/ministryService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const palette = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const initialSmartCardState = {
  patientId: "",
  type: "QR",
  token: "",
};

function MinistryDashboard({ setActivePage, showToast }) {
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [smartCardState, setSmartCardState] = useState(initialSmartCardState);
  const [smartCardBusy, setSmartCardBusy] = useState(false);
  const [smartCardResult, setSmartCardResult] = useState([]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const response = await fetchMinistryNotifications();
      setNotifications(response);
    } catch (fetchError) {
      console.error("Failed to load ministry notifications:", fetchError);
      const message = formatApiError(fetchError, "تعذر تحميل إشعارات الوزارة.");
      setNotificationsError(message);
      showToast?.(message, "danger");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadDashboard = async () => {
    const hasDashboard = Boolean(dashboard);
    setLoading(true);
    setErrorMessage("");
    setNotificationsLoading(true);

    const [dashboardResult, notificationsResult] = await Promise.allSettled([
      fetchMinistryDashboardData(),
      fetchMinistryNotifications(),
    ]);

    if (dashboardResult.status === "fulfilled") {
      setDashboard(dashboardResult.value);
    } else {
      const message = formatApiError(dashboardResult.reason, "تعذر تحميل لوحة الوزارة من الخادم.");
      console.error("Failed to load ministry dashboard:", dashboardResult.reason);
      setErrorMessage(message);

      if (hasDashboard) {
        showToast?.(message, "danger");
      }
    }

    if (notificationsResult.status === "fulfilled") {
      setNotifications(notificationsResult.value);
      setNotificationsError("");
    } else {
      console.error("Failed to load ministry notifications:", notificationsResult.reason);
      setNotificationsError(
        formatApiError(notificationsResult.reason, "تعذر تحميل إشعارات الوزارة.")
      );
    }

    setLoading(false);
    setNotificationsLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markMinistryNotificationAsRead(notificationId);
      showToast?.("تم تعليم الإشعار كمقروء.", "success");
      await loadNotifications();
    } catch (markError) {
      console.error("Failed to mark notification as read:", markError);
      showToast?.(formatApiError(markError, "تعذر تحديث حالة الإشعار."), "danger");
    }
  };

  const handleGenerateSmartCard = async (event) => {
    event.preventDefault();

    if (!smartCardState.patientId.trim()) {
      showToast?.("يرجى إدخال معرف المريض أولاً.", "warning");
      return;
    }

    setSmartCardBusy(true);

    try {
      const response = await generatePatientSmartCard({
        patientId: smartCardState.patientId,
        type: smartCardState.type,
      });

      setSmartCardResult(
        buildDisplayLines(response?.data?.data || response?.data || {}).slice(0, 12)
      );
      showToast?.("تم إصدار بطاقة الطوارئ الذكية بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to generate smart card:", submitError);
      showToast?.(formatApiError(submitError, "تعذر إصدار البطاقة الذكية."), "danger");
    } finally {
      setSmartCardBusy(false);
    }
  };

  const handleRedeemSmartCard = async (event) => {
    event.preventDefault();

    if (!smartCardState.token.trim()) {
      showToast?.("يرجى إدخال رمز البطاقة أولاً.", "warning");
      return;
    }

    setSmartCardBusy(true);

    try {
      const response = await redeemSmartCardToken(smartCardState.token);
      setSmartCardResult(buildDisplayLines(response).slice(0, 20));
      showToast?.("تم جلب عرض الطوارئ للبطاقة بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to redeem smart card:", submitError);
      showToast?.(formatApiError(submitError, "تعذر قراءة رمز البطاقة."), "danger");
    } finally {
      setSmartCardBusy(false);
    }
  };

  const registrations = dashboard?.registrations || [];
  const doctorsBySpecialty = dashboard?.doctorsBySpecialty || [];
  const hospitalsByType = dashboard?.hospitalsByType || [];
  const statsLines = dashboard?.statsLines || [];

  const registrationChartData = {
    labels: registrations.map((item) => item.label),
    datasets: [
      {
        label: "التسجيلات",
        data: registrations.map((item) => item.value),
        backgroundColor: "rgba(37, 99, 235, 0.18)",
        borderColor: "#2563eb",
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  const buildDoughnutData = (items) => ({
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: items.map((item) => item.value),
        backgroundColor: palette.slice(0, items.length),
        borderColor: "#ffffff",
        borderWidth: 4,
      },
    ],
  });

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: "72%",
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e2e8f0" },
        ticks: { color: "#64748b", font: { family: "IBM Plex Sans Arabic" } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { family: "IBM Plex Sans Arabic" } },
      },
    },
  };

  return (
    <div id="ministryDashboardPage" className="page-content active">
      <MinistryPageHeader
        title="وزارة الصحة"
        description="لوحة متابعة مركزية لمؤشرات الوزارة مع إشعارات النظام وخدمات البطاقات الذكية"
      />

      {loading && !dashboard ? (
        <MinistryDataState loading loadingText="جارٍ تحميل مؤشرات الوزارة..." />
      ) : errorMessage && !dashboard ? (
        <MinistryDataState error errorText={errorMessage} onRetry={loadDashboard} />
      ) : (
        <>
          <div className="cards">
            {(dashboard?.cards || []).map((card) => (
              <MinistryStatCard
                key={card.id}
                label={card.label}
                value={card.value}
                suffix={card.suffix}
                icon={
                  card.id === "patients" ? <FaUserGroup /> :
                    card.id === "doctors" ? <FaUserDoctor /> :
                      card.id === "hospitals" ? <FaHospital /> :
                        <FaBuildingCircleCheck />
                }
              />
            ))}
          </div>

          <div className="content" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
            <div className="box">
              <div className="box-header">
                <h2 style={{ marginBottom: 0 }}>إحصائيات التسجيلات</h2>
                <button type="button" className="btn btn-secondary" onClick={loadDashboard}>
                  <FaRotate />
                  تحديث البيانات
                </button>
              </div>
              {dashboard?.widgetErrors?.registrations && registrations.length === 0 ? (
                <MinistryDataState error errorText={dashboard.widgetErrors.registrations} />
              ) : registrations.length === 0 ? (
                <MinistryDataState isEmpty emptyText="لا توجد تسجيلات كافية لعرض المنحنى حالياً." />
              ) : (
                <div style={{ height: "300px" }}>
                  <Bar data={registrationChartData} options={barOptions} />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
              <div className="box">
                <h2>توزيع الأطباء حسب التخصص</h2>
                {dashboard?.widgetErrors?.doctorsBySpecialty && doctorsBySpecialty.length === 0 ? (
                  <MinistryDataState error errorText={dashboard.widgetErrors.doctorsBySpecialty} />
                ) : doctorsBySpecialty.length === 0 ? (
                  <MinistryDataState isEmpty emptyText="لا توجد بيانات تخصصات متاحة." />
                ) : (
                  <div className="ministry-donut-layout">
                    <div className="ministry-donut-chart">
                      <Doughnut
                        data={buildDoughnutData(doctorsBySpecialty)}
                        options={doughnutOptions}
                      />
                      <div className="ministry-donut-center">
                        <strong>{dashboard?.cards?.[1]?.value || 0}</strong>
                        <span>طبيب</span>
                      </div>
                    </div>
                    <div className="ministry-legend-list">
                      {doctorsBySpecialty.map((item, index) => (
                        <div key={item.label} className="ministry-legend-item">
                          <span>
                            <b style={{ background: palette[index] }} />
                            {item.label}
                          </span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="box">
                <h2>توزيع المنشآت حسب النوع</h2>
                {dashboard?.widgetErrors?.hospitalsByType && hospitalsByType.length === 0 ? (
                  <MinistryDataState error errorText={dashboard.widgetErrors.hospitalsByType} />
                ) : hospitalsByType.length === 0 ? (
                  <MinistryDataState isEmpty emptyText="لا توجد بيانات أنواع منشآت متاحة." />
                ) : (
                  <div className="ministry-donut-layout">
                    <div className="ministry-donut-chart">
                      <Doughnut
                        data={buildDoughnutData(hospitalsByType)}
                        options={doughnutOptions}
                      />
                      <div className="ministry-donut-center">
                        <strong>{dashboard?.cards?.[2]?.value || 0}</strong>
                        <span>منشأة</span>
                      </div>
                    </div>
                    <div className="ministry-legend-list">
                      {hospitalsByType.map((item, index) => (
                        <div key={item.label} className="ministry-legend-item">
                          <span>
                            <b style={{ background: palette[index] }} />
                            {item.label}
                          </span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "25px" }}>
            <div className="box">
              <div className="box-header">
                <h2 style={{ marginBottom: 0 }}>إشعارات الوزارة</h2>
                <button type="button" className="btn btn-secondary" onClick={loadNotifications}>
                  <FaBell />
                  تحديث الإشعارات
                </button>
              </div>
              {notificationsError ? (
                <div
                  style={{
                    marginBottom: notifications.length > 0 ? "12px" : 0,
                    color: "var(--accent-red)",
                    fontSize: "12px",
                  }}
                >
                  {notificationsError}
                </div>
              ) : null}
              {notificationsLoading && notifications.length === 0 ? (
                <MinistryDataState loading loadingText="جارٍ تحميل الإشعارات..." />
              ) : notificationsError && notifications.length === 0 ? (
                <MinistryDataState error errorText={notificationsError} onRetry={loadNotifications} />
              ) : notifications.length === 0 ? (
                <MinistryDataState isEmpty emptyText="لا توجد إشعارات حالية لهذا الحساب." />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>العنوان</th>
                        <th>الأولوية</th>
                        <th>التاريخ</th>
                        <th style={{ textAlign: "center" }}>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.slice(0, 6).map((notification) => (
                        <tr key={notification.id}>
                          <td>
                            <div style={{ display: "grid", gap: "4px" }}>
                              <strong style={{ color: "var(--primary)" }}>{notification.title}</strong>
                              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                                {notification.body}
                              </span>
                            </div>
                          </td>
                          <td>{notification.priority}</td>
                          <td style={{ fontFamily: "Outfit" }}>{notification.createdAt}</td>
                          <td style={{ textAlign: "center" }}>
                            {notification.isRead ? (
                              <span className="status">مقروء</span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ minWidth: "auto", padding: "8px 12px" }}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                تعليم كمقروء
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="box">
              <h2>البطاقات الذكية للطوارئ</h2>
              <form onSubmit={handleGenerateSmartCard} style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
                  <input
                    placeholder="معرف المريض"
                    value={smartCardState.patientId}
                    onChange={(event) =>
                      setSmartCardState((current) => ({ ...current, patientId: event.target.value }))
                    }
                  />
                  <select
                    value={smartCardState.type}
                    onChange={(event) =>
                      setSmartCardState((current) => ({ ...current, type: event.target.value }))
                    }
                  >
                    <option value="QR">QR</option>
                  </select>
                </div>
                <button type="submit" className="btn" disabled={smartCardBusy}>
                  <FaCreditCard />
                  إصدار بطاقة ذكية
                </button>
              </form>

              <form onSubmit={handleRedeemSmartCard} style={{ display: "grid", gap: "12px" }}>
                <input
                  placeholder="رمز البطاقة"
                  value={smartCardState.token}
                  onChange={(event) =>
                    setSmartCardState((current) => ({ ...current, token: event.target.value }))
                  }
                />
                <button type="submit" className="btn btn-secondary" disabled={smartCardBusy}>
                  <FaCreditCard />
                  قراءة رمز البطاقة
                </button>
              </form>

              <div style={{ marginTop: "18px" }}>
                {smartCardResult.length === 0 ? (
                  <MinistryDataState isEmpty emptyText="سيظهر هنا ناتج إصدار البطاقة أو عرض الطوارئ بعد التنفيذ." />
                ) : (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {smartCardResult.map((line) => (
                      <div
                        key={line}
                        style={{
                          padding: "12px 14px",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          background: "#f8fafc",
                          fontSize: "13px",
                          color: "var(--text-dark)",
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "25px" }}>
            <div className="box">
              <h2>مؤشرات النظام من API الوزارة</h2>
              {statsLines.length === 0 ? (
                <MinistryDataState isEmpty emptyText="لم يرجع الخادم مؤشرات إضافية قابلة للعرض." />
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  {statsLines.map((line) => (
                    <div
                      key={line}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                        background: "#f8fafc",
                        fontSize: "13px",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="box">
              <h2>اختصارات الإدارة السريعة</h2>
              <div className="ministry-shortcuts-grid">
                <button type="button" className="btn btn-secondary ministry-shortcut" onClick={() => setActivePage("hospitals")}>
                  <FaHospital />
                  <span>إدارة المنشآت</span>
                </button>
                <button type="button" className="btn btn-secondary ministry-shortcut" onClick={() => setActivePage("doctors")}>
                  <FaUserDoctor />
                  <span>إدارة المستخدمين</span>
                </button>
                <button type="button" className="btn btn-secondary ministry-shortcut" onClick={() => setActivePage("departments")}>
                  <FaBuildingCircleCheck />
                  <span>الأقسام والكتالوجات</span>
                </button>
                <button type="button" className="btn btn-secondary ministry-shortcut" onClick={() => setActivePage("reports")}>
                  <FaChartColumn />
                  <span>التقارير والرقابة</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MinistryDashboard;
