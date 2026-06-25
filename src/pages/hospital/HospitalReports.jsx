import React, { useState } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

import { 
  FaCalendarDays, 
  FaRotate, 
  FaBed, 
  FaUserDoctor, 
  FaLaptopMedical, 
  FaDoorOpen, 
  FaFileMedical, 
  FaFileInvoice, 
  FaNotesMedical, 
  FaSitemap, 
  FaHospital, 
  FaMedal, 
  FaFireFlameSimple, 
  FaClockRotateLeft, 
  FaChartPie, 
  FaCircleRadiation, 
  FaCircleExclamation, 
  FaCircleInfo, 
  FaFileExcel, 
  FaPrint, 
  FaRegBell,
  FaCaretUp,
  FaTriangleExclamation,
  FaCheck,
  FaFilePdf
} from "react-icons/fa6";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";

import { 
  initialKPIsData, 
  initialAlertsData, 
  initialPerformanceKPIs 
} from "../../data/hospital/reports";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function HospitalReports({ showToast }) {
  const [period, setPeriod] = useState("الشهر الحالي (يونيو 2026)");
  const [alerts, setAlerts] = useState(initialAlertsData);

  // Trigger Toast/Alert actions
  const handleActionToast = (message) => {
    showToast?.(message, "info");
  };

  // Chart 1: Patients per Department (Bar Chart)
  const barChart1Data = {
    labels: ["الباطنة", "الجراحة العامة", "الأطفال", "القلب والأوعية", "العظام", "الطوارئ"],
    datasets: [
      {
        label: "عدد المرضى",
        data: [320, 240, 180, 120, 150, 274],
        backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1"],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const barChart1Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e2e8f0" }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
      x: { grid: { display: false }, ticks: { font: { family: "IBM Plex Sans Arabic" } } }
    }
  };

  // Chart 2: Surgeries last 6 months (Line Chart)
  const lineChartData = {
    labels: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"],
    datasets: [
      {
        label: "العمليات الجراحية",
        data: [45, 58, 52, 68, 60, 74],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#6366f1",
        pointRadius: 4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e2e8f0" }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
      x: { grid: { display: false }, ticks: { font: { family: "IBM Plex Sans Arabic" } } }
    }
  };

  // Chart 3: Current Bed Occupancy (Doughnut)
  const doughnutChartData = {
    labels: ["أسرة شاغرة", "أسرة مشغولة", "أسرة قيد الصيانة"],
    datasets: [
      {
        data: [66, 234, 15],
        backgroundColor: ["#10b981", "#2563eb", "#ef4444"],
        borderWidth: 4,
        borderColor: "#ffffff"
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { family: "IBM Plex Sans Arabic", size: 11 },
          color: "#1e293b"
        }
      }
    },
    cutout: "70%"
  };

  // Chart 4: Busiest Departments (Horizontal Bar Chart)
  const barChart2Data = {
    labels: ["الطوارئ", "العيادات الخارجية", "العيادات التخصصية", "العمليات", "الرعاية المركزة"],
    datasets: [
      {
        label: "الزيارات",
        data: [850, 620, 480, 310, 120],
        backgroundColor: ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const barChart2Options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: "var(--border-color)" }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
      y: { grid: { display: false }, ticks: { font: { family: "IBM Plex Sans Arabic" } } }
    }
  };

  return (
    <div id="hospitalReportsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>التقارير والإحصائيات 📊</h2>
          <p>لوحة التحكم بالتقارير الإدارية ومؤشرات الأداء وتحليل الكفاءة التشغيلية</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Filter toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "var(--primary)" }}>لوحة مؤشرات الكفاءة</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>متابعة حية ومباشرة لمؤشرات أداء المستشفى ونسب التشغيل</p>
        </div>
        <div className="filters-toolbar" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "220px" }}>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ paddingRight: "35px", cursor: "pointer", background: "white", fontWeight: "bold" }}
            >
              <option value="الشهر الحالي (يونيو 2026)">الشهر الحالي (يونيو 2026)</option>
              <option value="الربع السنوي الأخير">الربع السنوي الأخير</option>
              <option value="النصف الأول من العام">النصف الأول من العام</option>
              <option value="العام الحالي بالكامل">العام الحالي بالكامل</option>
            </select>
            <FaCalendarDays style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "12px", pointerEvents: "none" }} />
          </div>
          <button className="btn" onClick={() => handleActionToast("تم تحديث البيانات والإحصائيات بنجاح.")} style={{ background: "var(--accent-emerald)" }}>
            <FaRotate style={{ marginLeft: "5px" }} /> تحديث البيانات
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cards">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إجمالي المرضى</h3>
              <p style={{ fontSize: "28px", marginTop: "5px" }}>1,284</p>
            </div>
            <span style={{ fontSize: "20px", color: "var(--accent-purple)", background: "rgba(139, 92, 246, 0.08)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaBed />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", marginTop: "15px", color: "var(--accent-emerald)" }}>
            <FaCaretUp /> <strong>12.5%+</strong> <span style={{ color: "var(--text-muted)" }}>مقارنة بالشهر الماضي</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إجمالي الأطباء</h3>
              <p style={{ fontSize: "28px", marginTop: "5px" }}>85</p>
            </div>
            <span style={{ fontSize: "20px", color: "var(--secondary)", background: "var(--primary-glow)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaUserDoctor />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", marginTop: "15px", color: "var(--accent-emerald)" }}>
            <FaCaretUp /> <strong>3 أطباء جدد</strong> <span style={{ color: "var(--text-muted)" }}>انضموا هذا الأسبوع</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إجمالي العمليات</h3>
              <p style={{ fontSize: "28px", marginTop: "5px" }}>342</p>
            </div>
            <span style={{ fontSize: "20px", color: "var(--primary)", background: "var(--primary-glow)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaLaptopMedical />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", marginTop: "15px", color: "var(--accent-emerald)" }}>
            <FaCheck /> <strong>98.2%</strong> <span style={{ color: "var(--text-muted)" }}>نسبة نجاح العمليات</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إشغال الأسرة</h3>
              <p style={{ fontSize: "28px", marginTop: "5px" }}>78%</p>
            </div>
            <span style={{ fontSize: "20px", color: "var(--accent-emerald)", background: "rgba(16, 185, 129, 0.08)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaDoorOpen />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", marginTop: "15px", color: "var(--accent-amber)" }}>
            <FaTriangleExclamation /> <strong>إشغال مرتفع</strong> <span style={{ color: "var(--text-muted)" }}>في العناية المركزة</span>
          </div>
        </div>
      </div>

      {/* Quick Report Buttons Section */}
      <div className="box">
        <h2>قسم التقارير السريعة</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري تجهيز تقرير تفصيلي عن المرضى المقيمين...")} style={{ flexDirection: "column", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px", color: "var(--accent-purple)" }}><FaFileMedical /></span>
            <span style={{ fontSize: "12.5px", fontWeight: "bold" }}>تقرير المرضى</span>
          </button>
          
          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري تجهيز تقرير إحصائي للأطقم الطبية...")} style={{ flexDirection: "column", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px", color: "var(--secondary)" }}><FaFileInvoice /></span>
            <span style={{ fontSize: "12.5px", fontWeight: "bold" }}>تقرير الأطباء</span>
          </button>
          
          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري تحضير ملف عمليات الجراحة...")} style={{ flexDirection: "column", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px", color: "var(--primary)" }}><FaNotesMedical /></span>
            <span style={{ fontSize: "12.5px", fontWeight: "bold" }}>تقرير العمليات</span>
          </button>

          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري سحب إحصائيات الأقسام...")} style={{ flexDirection: "column", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px", color: "var(--accent-amber)" }}><FaSitemap /></span>
            <span style={{ fontSize: "12.5px", fontWeight: "bold" }}>تقرير الأقسام</span>
          </button>

          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري استخراج كفاءة الأسرة الاستيعابية...")} style={{ flexDirection: "column", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px", color: "var(--accent-emerald)" }}><FaHospital /></span>
            <span style={{ fontSize: "12.5px", fontWeight: "bold" }}>تقرير الأسرة</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="content" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="box">
          <h2>📊 عدد المرضى المقيمين لكل قسم</h2>
          <div style={{ height: "260px" }}>
            <Bar data={barChart1Data} options={barChart1Options} />
          </div>
        </div>

        <div className="box">
          <h2>📈 العمليات الجراحية خلال آخر 6 أشهر</h2>
          <div style={{ height: "260px" }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="box">
          <h2>🛌 توزيع إشغال الأسرة الحالية</h2>
          <div style={{ height: "260px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "230px", height: "230px" }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>

        <div className="box">
          <h2>📊 أكثر الأقسام الطبية استقبالاً للمرضى</h2>
          <div style={{ height: "260px" }}>
            <Bar data={barChart2Data} options={barChart2Options} />
          </div>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="box">
        <h2>🏆 مؤشرات الأداء الرئيسية اليومية (KPIs)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          {initialPerformanceKPIs.map((kpi, idx) => (
            <div key={idx} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px", 
              padding: "15px", 
              background: "var(--bg-main)", 
              borderRadius: "var(--radius-md)", 
              border: "1px solid var(--border-color)" 
            }}>
              <div style={{ 
                width: "44px", 
                height: "44px", 
                borderRadius: "50%", 
                background: kpi.color === "amber" ? "var(--accent-amber-light)" : kpi.color === "rose" ? "var(--accent-red-light)" : kpi.color === "blue" ? "var(--primary-light)" : "var(--accent-emerald-light)", 
                color: kpi.color === "amber" ? "var(--accent-amber)" : kpi.color === "rose" ? "var(--accent-red)" : kpi.color === "blue" ? "var(--primary)" : "var(--accent-emerald)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "18px"
              }}>
                {kpi.color === "amber" && <FaMedal />}
                {kpi.color === "rose" && <FaFireFlameSimple />}
                {kpi.color === "blue" && <FaClockRotateLeft />}
                {kpi.color === "emerald" && <FaChartPie />}
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>{kpi.title}</span>
                <h5 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-dark)", margin: "2px 0 0 0" }}>{kpi.subtitle}</h5>
                <p style={{ 
                  fontSize: "11.5px", 
                  color: kpi.color === "amber" ? "var(--accent-amber)" : kpi.color === "rose" ? "var(--accent-red)" : kpi.color === "blue" ? "var(--secondary)" : "var(--accent-emerald)", 
                  margin: "2px 0 0 0",
                  fontWeight: "bold" 
                }}>{kpi.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Administrative Alerts Log */}
      <div className="box">
        <h2>📢 التنبيهات الإدارية المباشرة</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{ 
              padding: "15px", 
              background: alert.type === "danger" ? "var(--accent-red-light)" : alert.type === "warning" ? "var(--accent-amber-light)" : "var(--primary-light)", 
              borderRight: `4px solid ${alert.type === "danger" ? "var(--accent-red)" : alert.type === "warning" ? "var(--accent-amber)" : "var(--secondary)"}`, 
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "15px"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ 
                  fontSize: "18px", 
                  color: alert.type === "danger" ? "var(--accent-red)" : alert.type === "warning" ? "var(--accent-amber)" : "var(--primary)",
                  marginTop: "2px"
                }}>
                  {alert.type === "danger" && <FaCircleRadiation />}
                  {alert.type === "warning" && <FaCircleExclamation />}
                  {alert.type === "info" && <FaCircleInfo />}
                </span>
                <div>
                  <h5 style={{ 
                    fontSize: "13.5px", 
                    fontWeight: "bold", 
                    color: alert.type === "danger" ? "#991b1b" : alert.type === "warning" ? "#92400e" : "var(--primary)",
                    margin: 0
                  }}>{alert.title}</h5>
                  <p style={{ fontSize: "12px", color: "var(--text-dark)", marginTop: "4px", lineHeight: "1.5" }}>{alert.text}</p>
                </div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "Outfit", whiteSpace: "nowrap" }}>{alert.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Export tools */}
      <div className="box" style={{ marginBottom: "10px" }}>
        <h2>📥 خيارات تصدير التقارير الإدارية</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري توليد ملف PDF متكامل وحفظه لجهازك...")} style={{ gap: "8px", height: "45px", fontWeight: "bold" }}>
            <FaFilePdf style={{ color: "var(--accent-red)", fontSize: "16px" }} />
            تصدير كملف PDF
          </button>
          
          <button className="btn btn-secondary" onClick={() => handleActionToast("جاري إعداد جدول البيانات بصيغة Excel...")} style={{ gap: "8px", height: "45px", fontWeight: "bold" }}>
            <FaFileExcel style={{ color: "var(--accent-emerald)", fontSize: "16px" }} />
            تصدير كملف Excel
          </button>

          <button className="btn btn-secondary" onClick={() => window.print()} style={{ gap: "8px", height: "45px", fontWeight: "bold" }}>
            <FaPrint style={{ color: "var(--primary)", fontSize: "16px" }} />
            طباعة التقرير بالكامل
          </button>
        </div>
      </div>
    </div>
  );
}

export default HospitalReports;
