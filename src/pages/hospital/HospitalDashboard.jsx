import React, { useEffect, useState } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";
import { FaHospital, FaUserDoctor, FaBedPulse, FaUsers, FaFolderPlus, FaFileWaveform, FaUserPlus, FaUserInjured } from "react-icons/fa6";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { initialCaseDistributionData } from "../../data/hospital/reports";
import { getHospitalAnalytics } from "../../services/analyticsService";

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function HospitalDashboard({ setActivePage, showToast }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { analytics } = await getHospitalAnalytics();
        setAnalytics(analytics);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const specCounts = analytics?.doctorsBySpecialization || {};
  const totalDocs = Object.values(specCounts).reduce((a, b) => a + b, 0);
  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1", "#ec4899", "#34d399", "#f87171", "#60a5fa"];
  const caseDistribution = Object.entries(specCounts).map(([name, count], index) => {
    const percentage = totalDocs > 0 ? ((count / totalDocs) * 100).toFixed(1) + "%" : "0%";
    return {
      id: index,
      name,
      count,
      percentage,
      color: colors[index % colors.length]
    };
  });

  // Chart data: Doctors by Specialization (derived from backend)
  const barChartData = {
    labels: Object.keys(specCounts),
    datasets: [{
      label: "عدد الأطباء",
      data: Object.values(specCounts),
      backgroundColor: Object.keys(specCounts).map((_, i) => colors[i % colors.length]),
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e2e8f0" }, ticks: { color: "#64748b", font: { family: "IBM Plex Sans Arabic" } } },
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { family: "IBM Plex Sans Arabic" } } }
    }
  };

  const doughnutChartData = {
    labels: ["متاح", "مشغول"],
    datasets: [{
      data: [analytics?.availableBeds ?? 0, analytics?.occupiedBeds ?? 0],
      backgroundColor: ["#10b981", "#2563eb"],
      borderWidth: 4,
      borderColor: "#ffffff",
    }]
  };

  const doughnutChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: "75%" };

  return (
    <div id="hospitalDashboardPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2>لوحة التحكم الإدارية 👋</h2>
          </div>
          <p>لوحة متابعة وإدارة المستشفى والأقسام والكوادر الطبية</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Stats Cards */}
      <div className="cards">
        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <>
            <div className="card">
              <h3>الأقسام الطبية</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p>{analytics?.departmentCount ?? 0}</p>
                <span style={{ fontSize: "24px", background: "var(--primary-glow)", color: "var(--primary)", padding: "10px", borderRadius: "var(--radius-sm)", display: "inline-flex" }}>
                  <FaHospital />
                </span>
              </div>
            </div>
            <div className="card">
              <h3>إجمالي الأطباء</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p>{analytics?.doctorCount ?? 0}</p>
                <span style={{ fontSize: "24px", background: "var(--primary-glow)", color: "var(--secondary)", padding: "10px", borderRadius: "var(--radius-sm)", display: "inline-flex" }}>
                  <FaUserDoctor />
                </span>
              </div>
            </div>
            <div className="card">
              <h3>الأسرة المشغولة</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p>{analytics?.occupiedBeds ?? 0}</p>
                <span style={{ fontSize: "24px", background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)", padding: "10px", borderRadius: "var(--radius-sm)", display: "inline-flex" }}>
                  <FaBedPulse />
                </span>
              </div>
            </div>
            <div className="card">
              <h3>المرضى المقيمين</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p>{analytics?.inpatients ?? 0}</p>
                <span style={{ fontSize: "24px", background: "rgba(139, 92, 246, 0.08)", color: "var(--accent-purple)", padding: "10px", borderRadius: "var(--radius-sm)", display: "inline-flex" }}>
                  <FaUsers />
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Charts Content */}
      <div className="content">
        {/* Left Side: Case Statistics Chart and Table */}
        <div className="box">
          <h2>📊 منحنى إحصائيات الحالات (أكثر التخصصات)</h2>
          <div style={{ height: "260px", marginBottom: "20px" }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "right" }}>نوع الحالة / القسم</th>
                  <th style={{ textAlign: "center" }}>عدد الحالات</th>
                  <th style={{ textAlign: "center" }}>النسبة المئوية</th>
                </tr>
              </thead>
              <tbody>
                {caseDistribution.map(item => (
                  <tr key={item.id}>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "var(--text-dark)" }}>
                      <span style={{ display: "inline-block", width: "12px", height: "6px", borderRadius: "3px", background: item.color, marginLeft: "8px" }}></span>
                      {item.name}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "bold", fontFamily: "Outfit" }}>{item.count}</td>
                    <td style={{ textAlign: "center", color: "var(--text-muted)", fontFamily: "Outfit" }}>{item.percentage}</td>
                  </tr>
                ))}
                {caseDistribution.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "15px", color: "var(--text-muted)" }}>لا توجد بيانات متاحة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Bed Status and Quick Actions */}
        <div>
          {/* Bed Occupancy Pie Chart */}
          <div className="box">
            <h2>🛌 حالة إشغال الأسرة الدائرية</h2>
            <div style={{ height: "160px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              <div style={{ position: "absolute", textAlign: "center", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--primary)", fontFamily: "Outfit" }}>{analytics?.bedOccupancyRate ?? 0}%</span>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "0" }}>معدل الإشغال</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "center", fontSize: "12px", marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
              <div><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-emerald)", marginLeft: "5px" }}></span> متاح ({analytics?.availableBeds ?? 0})</div>
              <div><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", marginLeft: "5px" }}></span> مشغول ({analytics?.occupiedBeds ?? 0})</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="box">
            <h2>⚡ الخدمات السريعة</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setActivePage("doctors")} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "15px", height: "85px", borderRadius: "var(--radius-md)" }}>
                <FaUserPlus style={{ fontSize: "20px", marginBottom: "5px", color: "var(--primary)" }} />
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>إضافة طبيب</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setActivePage("inpatients")} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "15px", height: "85px", borderRadius: "var(--radius-md)" }}>
                <FaUserInjured style={{ fontSize: "20px", marginBottom: "5px", color: "var(--primary)" }} />
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>إضافة مريض</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setActivePage("departments")} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "15px", height: "85px", borderRadius: "var(--radius-md)" }}>
                <FaFolderPlus style={{ fontSize: "20px", marginBottom: "5px", color: "var(--primary)" }} />
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>إضافة قسم</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setActivePage("reports")} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "15px", height: "85px", borderRadius: "var(--radius-md)" }}>
                <FaFileWaveform style={{ fontSize: "20px", marginBottom: "5px", color: "var(--primary)" }} />
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>تقرير المستشفى</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalDashboard;
