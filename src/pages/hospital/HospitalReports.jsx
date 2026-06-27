import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

import {
  FaCalendarDays,
  FaRotate,
  FaBed,
  FaUserDoctor,
  FaLaptopMedical,
  FaDoorOpen,
  FaMedal,
  FaFireFlameSimple,
  FaClockRotateLeft,
  FaChartPie,
  FaFileExcel,
  FaPrint,
  FaFilePdf,
  FaSpinner
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
  Filler,
} from "chart.js";

import api from "../../utils/api";
import { getHospitalAnalytics } from "../../services/analyticsService";

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

const monthNamesArabic = {
  "01": "يناير", "02": "فبراير", "03": "مارس", "04": "أبريل", "05": "مايو", "06": "يونيو",
  "07": "يوليو", "08": "أغسطس", "09": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر",
  "1": "يناير", "2": "فبراير", "3": "مارس", "4": "أبريل", "5": "مايو", "6": "يونيو",
  "7": "يوليو", "8": "أغسطس", "9": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر",
  "january": "يناير", "february": "فبراير", "march": "مارس", "april": "أبريل", "may": "مايو", "june": "يونيو",
  "july": "يوليو", "august": "أغسطس", "september": "سبتمبر", "october": "أكتوبر", "november": "نوفمبر", "december": "ديسمبر"
};

function HospitalReports({ showToast }) {
  const [period, setPeriod] = useState("الشهر الحالي (يونيو 2026)");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Individual backend report states
  const [performanceReport, setPerformanceReport] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);
  const [departmentsReport, setDepartmentsReport] = useState(null);
  const [operationsReport, setOperationsReport] = useState(null);
  const [patientsReport, setPatientsReport] = useState(null);

  // Dynamic active facilityId resolution
  const facilityId = sessionStorage.getItem("facilityId") || "f203157f-0975-4bcf-b8c7-48c2fba672bf";

  // Helper to map selected period option to ISO from/to date ranges
  const getDateRange = (selectedPeriod) => {
    let fromDate = new Date();
    let toDate = new Date();

    if (selectedPeriod === "الشهر الحالي (يونيو 2026)") {
      fromDate = new Date("2026-06-01T00:00:00Z");
      toDate = new Date("2026-06-30T23:59:59Z");
    } else if (selectedPeriod === "الربع السنوي الأخير") {
      fromDate = new Date("2026-04-01T00:00:00Z");
      toDate = new Date("2026-06-30T23:59:59Z");
    } else if (selectedPeriod === "النصف الأول من العام") {
      fromDate = new Date("2026-01-01T00:00:00Z");
      toDate = new Date("2026-06-30T23:59:59Z");
    } else if (selectedPeriod === "العام الحالي بالكامل") {
      fromDate = new Date("2026-01-01T00:00:00Z");
      toDate = new Date("2026-12-31T23:59:59Z");
    }

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
  };

  // Fetch reports from backend
  const fetchAllReports = async () => {
    setLoading(true);
    setError(false);
    try {
      const { from, to } = getDateRange(period);
      const params = { from, to };

      const [perfRes, occRes, deptRes, operRes, patRes, analyticsRes] = await Promise.all([
        api.get(`/api/v1/facilities/${facilityId}/reports/performance`, { params }),
        api.get(`/api/v1/facilities/${facilityId}/reports/occupancy`),
        api.get(`/api/v1/facilities/${facilityId}/reports/departments`, { params }),
        api.get(`/api/v1/facilities/${facilityId}/reports/operations`, { params }),
        api.get(`/api/v1/facilities/${facilityId}/reports/patients`, { params }),
        getHospitalAnalytics().catch((err) => {
          console.error("Failed to load core analytics in reports:", err);
          return { analytics: null };
        })
      ]);

      setPerformanceReport(perfRes.data?.data || {});
      setOccupancyReport(occRes.data?.data || {});
      setDepartmentsReport(deptRes.data?.data || []);
      setOperationsReport(operRes.data?.data || {});
      setPatientsReport(patRes.data?.data || {});
      
      if (analyticsRes.analytics) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [period, facilityId]);

  // Client-Side CSV Export (Excel) using real reports state
  const exportToExcel = () => {
    try {
      let csvContent = "\ufeff"; // UTF-8 BOM for Arabic support
      
      // Header
      csvContent += "التقرير,البيان,القيمة\n";
      
      // Stats
      csvContent += `إجمالي المرضى,,${patientsReport?.totalCount ?? patientsReport?.count ?? analytics?.patientCount ?? 0}\n`;
      csvContent += `إجمالي الأطباء,,${performanceReport?.doctorCount ?? performanceReport?.count ?? analytics?.doctorCount ?? 0}\n`;
      csvContent += `إجمالي العمليات,,${getTotalOperationsCount()}\n`;
      csvContent += `إشغال الأسرة,,${occupancyReport?.occupiedBeds ?? analytics?.occupiedBeds ?? 0}\n\n`;
      
      // Departments Table
      csvContent += "القسم,عدد المرضى التنويم,عدد الزيارات/العمليات\n";
      const deptsList = Array.isArray(departmentsReport) 
        ? departmentsReport 
        : (departmentsReport?.items || []);

      deptsList.forEach(dept => {
        const name = dept.departmentName || dept.name || "";
        const patients = dept.inpatientCount || dept.patientCount || 0;
        const visits = dept.visitCount || dept.encounterCount || dept.count || 0;
        csvContent += `"${name}",${patients},${visits}\n`;
      });
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_المستشفى_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast?.("تم تصدير ملف Excel بنجاح.", "success");
    } catch (error) {
      console.error("Export to Excel failed:", error);
      showToast?.("فشل تصدير ملف Excel.", "danger");
    }
  };

  // Helper: Sum operations count
  const getTotalOperationsCount = () => {
    if (operationsReport?.totalOperations !== undefined) return operationsReport.totalOperations;
    if (operationsReport?.count !== undefined) return operationsReport.count;
    
    const rawOpsList = Array.isArray(operationsReport)
      ? operationsReport
      : (operationsReport?.items || operationsReport?.monthlyStats || []);
      
    if (rawOpsList.length > 0) {
      return rawOpsList.reduce((acc, curr) => acc + (curr.count ?? curr.operationsCount ?? curr.total ?? curr.value ?? 0), 0);
    }
    return 0;
  };

  // Helper: Get occupancy percentage
  const getOccupancyRate = () => {
    if (occupancyReport?.occupancyRate !== undefined) return occupancyReport.occupancyRate;
    const occupied = occupancyReport?.occupiedBeds ?? analytics?.occupiedBeds ?? 0;
    const total = occupancyReport?.totalBeds ?? analytics?.totalBeds ?? 0;
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  // ===== Chart Data Processing =====
  
  const deptsList = Array.isArray(departmentsReport) 
    ? departmentsReport 
    : (departmentsReport?.items || []);

  // Chart 1: Patients per Department (Bar Chart)
  const chart1Labels = deptsList.length > 0 
    ? deptsList.map(d => d.departmentName || d.name || "قسم") 
    : ["لا توجد بيانات"];
  const chart1Data = deptsList.length > 0 
    ? deptsList.map(d => d.inpatientCount ?? d.patientCount ?? d.count ?? 0) 
    : [0];

  const barChart1Data = {
    labels: chart1Labels,
    datasets: [
      {
        label: "عدد المرضى المقيمين",
        data: chart1Data,
        backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1", "#ec4899", "#14b8a6", "#f43f5e", "#06b6d4"],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barChart1Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e2e8f0" }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
      x: { grid: { display: false }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
    },
  };

  // Chart 2: Surgeries/Operations over time (Line Chart)
  const rawOpsList = Array.isArray(operationsReport)
    ? operationsReport
    : (operationsReport?.items || operationsReport?.monthlyStats || []);

  let chart2Labels = [];
  let chart2Data = [];

  if (rawOpsList.length > 0) {
    chart2Labels = rawOpsList.map(op => {
      const k = String(op.month || op.monthName || op.date || op.scheduledAt || "");
      return monthNamesArabic[k.toLowerCase()] || k;
    });
    chart2Data = rawOpsList.map(op => op.count ?? op.operationsCount ?? op.total ?? op.value ?? 0);
  } else if (typeof operationsReport === "object" && operationsReport !== null) {
    const keys = Object.keys(operationsReport).filter(k => typeof operationsReport[k] === "number");
    if (keys.length > 0) {
      chart2Labels = keys.map(k => {
        if (k === "totalOperations" || k === "total") return "إجمالي العمليات";
        if (k === "completed" || k === "completedOperations") return "المكتملة";
        if (k === "scheduled" || k === "scheduledOperations") return "المجدولة";
        if (k === "cancelled" || k === "cancelledOperations") return "الملغاة";
        return k;
      });
      chart2Data = keys.map(k => operationsReport[k]);
    }
  }

  if (chart2Labels.length === 0) {
    chart2Labels = ["لا توجد بيانات"];
    chart2Data = [0];
  }

  const lineChartData = {
    labels: chart2Labels,
    datasets: [
      {
        label: "العمليات الجراحية",
        data: chart2Data,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#6366f1",
        pointRadius: 4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e2e8f0" }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
      x: { grid: { display: false }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
    },
  };

  // Chart 3: Current Bed Occupancy (Doughnut)
  let occupiedBedsCount = occupancyReport?.occupiedBeds ?? occupancyReport?.occupiedCount ?? analytics?.occupiedBeds ?? 0;
  let availableBedsCount = occupancyReport?.availableBeds ?? occupancyReport?.availableCount ?? analytics?.availableBeds ?? 0;
  let maintenanceBedsCount = occupancyReport?.maintenanceBeds ?? occupancyReport?.maintenanceCount ?? occupancyReport?.cleaningBeds ?? 0;

  if (occupiedBedsCount === 0 && availableBedsCount === 0) {
    availableBedsCount = 1; // Default segment to prevent rendering crash
  }

  const doughnutChartData = {
    labels: ["أسرة شاغرة", "أسرة مشغولة", "أسرة قيد الصيانة"],
    datasets: [
      {
        data: [availableBedsCount, occupiedBedsCount, maintenanceBedsCount],
        backgroundColor: ["#10b981", "#2563eb", "#ef4444"],
        borderWidth: 4,
        borderColor: "#ffffff",
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: { family: "IBM Plex Sans Arabic", size: 11 }, color: "#1e293b" } } },
    cutout: "70%",
  };

  // Chart 4: Busiest Departments (Horizontal Bar Chart)
  const sortedDepts = [...deptsList].sort((a, b) => {
    const valA = a.visitCount ?? a.encounterCount ?? a.admissionCount ?? a.totalCount ?? a.count ?? 0;
    const valB = b.visitCount ?? b.encounterCount ?? b.admissionCount ?? b.totalCount ?? b.count ?? 0;
    return valB - valA;
  });

  const chart4Labels = sortedDepts.length > 0 
    ? sortedDepts.map(d => d.departmentName || d.name || "قسم") 
    : ["لا توجد بيانات"];
  const chart4Data = sortedDepts.length > 0 
    ? sortedDepts.map(d => d.visitCount ?? d.encounterCount ?? d.admissionCount ?? d.totalCount ?? d.count ?? 0) 
    : [0];

  const barChart2Data = {
    labels: chart4Labels,
    datasets: [
      {
        label: "الزيارات",
        data: chart4Data,
        backgroundColor: ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#14b8a6", "#f43f5e", "#06b6d4"],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barChart2Options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: "var(--border-color)" }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
      y: { grid: { display: false }, ticks: { font: { family: "IBM Plex Sans Arabic" } } },
    },
  };

  // Dynamic KPI Highlights based on loaded report data
  const buildKPIs = () => {
    const kpis = [];

    const topDocName = performanceReport?.topDoctorName ?? performanceReport?.topDoctor ?? performanceReport?.busiestDoctor;
    const topDocCases = performanceReport?.topDoctorCases ?? performanceReport?.topDoctorCount;
    if (topDocName) {
      kpis.push({
        title: "أفضل طبيب (حالات)",
        subtitle: topDocName,
        text: topDocCases ? `${topDocCases} حالة` : "الأكثر نشاطاً",
        color: "amber"
      });
    }

    const busiestDeptName = performanceReport?.busiestDepartment ?? deptsList[0]?.departmentName ?? deptsList[0]?.name;
    const busiestDeptCount = performanceReport?.busiestDepartmentCount ?? (deptsList[0] ? (deptsList[0].visitCount ?? deptsList[0].inpatientCount ?? deptsList[0].count) : 0);
    if (busiestDeptName) {
      kpis.push({
        title: "أكثر قسم استقبالاً",
        subtitle: busiestDeptName,
        text: busiestDeptCount ? `${busiestDeptCount} حالة` : "الأعلى استقبالاً",
        color: "rose"
      });
    }

    const avgStay = performanceReport?.averageLengthOfStay ?? performanceReport?.avgStayDays ?? performanceReport?.averageStay;
    if (avgStay !== undefined && avgStay !== null) {
      kpis.push({
        title: "متوسط مدة الإقامة",
        subtitle: `${Number(avgStay).toFixed(1)} أيام للمريض`,
        text: "مؤشر الكفاءة التشغيلية",
        color: "blue"
      });
    }

    const rate = getOccupancyRate();
    if (rate > 0) {
      kpis.push({
        title: "معدل إشغال الأسرة الحالي",
        subtitle: `نسبة إشغال ${rate}%`,
        text: `المستهدف الموصى به: 80%`,
        color: "emerald"
      });
    }

    return kpis;
  };

  const activeKPIs = buildKPIs();

  return (
    <div id="hospitalReportsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2>التقارير والإحصائيات 📊</h2>
          </div>
          <p>لوحة التحكم بالتقارير الإدارية ومؤشرات الأداء وتحليل الكفاءة التشغيلية</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Filter toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "var(--primary)" }}>لوحة مؤشرات الكفاءة</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>متابعة حية ومباشرة لمؤشرات أداء المستشفى ونسب تشغيله</p>
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
          <button className="btn" onClick={fetchAllReports} style={{ background: "var(--accent-emerald)" }}>
            <FaRotate style={{ marginLeft: "5px" }} /> تحديث البيانات
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-state" style={{ textAlign: "center", padding: "40px", background: "var(--accent-red-light)", borderRadius: "12px", border: "1px solid var(--accent-red)", marginBottom: "20px" }}>
          <p style={{ color: "var(--accent-red)", fontWeight: "bold" }}>حدث خطأ أثناء تحميل التقارير والإحصائيات من الخادم.</p>
          <button className="btn" onClick={fetchAllReports} style={{ marginTop: "10px", background: "var(--primary)" }}>إعادة المحاولة</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="cards">
        {/* Total Patients */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إجمالي المرضى</h3>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "10px" }}>
                  <FaSpinner className="spinner" />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>جاري التحميل...</span>
                </div>
              ) : (
                <p style={{ fontSize: "28px", marginTop: "5px" }}>
                  {patientsReport?.totalCount ?? patientsReport?.count ?? analytics?.patientCount ?? 0}
                </p>
              )}
            </div>
            <span style={{ fontSize: "20px", color: "var(--accent-purple)", background: "rgba(139, 92, 246, 0.08)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaBed />
            </span>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إجمالي الأطباء</h3>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "10px" }}>
                  <FaSpinner className="spinner" />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>جاري التحميل...</span>
                </div>
              ) : (
                <p style={{ fontSize: "28px", marginTop: "5px" }}>
                  {performanceReport?.doctorCount ?? performanceReport?.count ?? analytics?.doctorCount ?? 0}
                </p>
              )}
            </div>
            <span style={{ fontSize: "20px", color: "var(--secondary)", background: "var(--primary-glow)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaUserDoctor />
            </span>
          </div>
        </div>

        {/* Total Operations */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إجمالي العمليات</h3>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "10px" }}>
                  <FaSpinner className="spinner" />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>جاري التحميل...</span>
                </div>
              ) : (
                <p style={{ fontSize: "28px", marginTop: "5px" }}>
                  {getTotalOperationsCount()}
                </p>
              )}
            </div>
            <span style={{ fontSize: "20px", color: "var(--primary)", background: "var(--primary-glow)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaLaptopMedical />
            </span>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>إشغال الأسرة</h3>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "10px" }}>
                  <FaSpinner className="spinner" />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>جاري التحميل...</span>
                </div>
              ) : (
                <p style={{ fontSize: "28px", marginTop: "5px" }}>
                  {occupancyReport?.occupiedBeds ?? occupancyReport?.occupiedCount ?? analytics?.occupiedBeds ?? 0}
                </p>
              )}
            </div>
            <span style={{ fontSize: "20px", color: "var(--accent-emerald)", background: "rgba(16, 185, 129, 0.08)", padding: "10px", borderRadius: "8px", display: "inline-flex", height: "40px" }}>
              <FaDoorOpen />
            </span>
          </div>
          {!loading && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
              معدل إشغال الأسرة: {getOccupancyRate()}%
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="content" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Patients per Department */}
        <div className="box">
          <h2>📊 عدد المرضى المقيمين لكل قسم</h2>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "260px" }}>
              <FaSpinner className="spinner" style={{ fontSize: "24px", color: "var(--primary)" }} />
            </div>
          ) : (
            <div style={{ height: "260px", marginBottom: "20px" }}>
              <Bar data={barChart1Data} options={barChart1Options} />
            </div>
          )}
        </div>

        {/* Surgeries Last 6 Months */}
        <div className="box">
          <h2>📈 العمليات الجراحية المجدولة والمنفذة</h2>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "260px" }}>
              <FaSpinner className="spinner" style={{ fontSize: "24px", color: "var(--primary)" }} />
            </div>
          ) : (
            <div style={{ height: "260px" }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          )}
        </div>

        {/* Bed Occupancy */}
        <div className="box">
          <h2>🛌 توزيع إشغال الأسرة الحالية</h2>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "260px" }}>
              <FaSpinner className="spinner" style={{ fontSize: "24px", color: "var(--primary)" }} />
            </div>
          ) : (
            <div style={{ height: "260px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          )}
        </div>

        {/* Busiest Departments */}
        <div className="box">
          <h2>📊 أكثر الأقسام الطبية استقبالاً للمرضى</h2>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "260px" }}>
              <FaSpinner className="spinner" style={{ fontSize: "24px", color: "var(--primary)" }} />
            </div>
          ) : (
            <div style={{ height: "260px" }}>
              <Bar data={barChart2Data} options={barChart2Options} />
            </div>
          )}
        </div>
      </div>

      {/* KPI Performance Highlights (Conditional on Real Data presence) */}
      {!loading && activeKPIs.length > 0 && (
        <div className="box">
          <h2>🏆 مؤشرات الأداء الرئيسية اليومية (KPIs)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            {activeKPIs.map((kpi, idx) => (
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
      )}

      {/* Report Export tools */}
      <div className="box" style={{ marginBottom: "10px" }}>
        <h2>📥 خيارات تصدير التقارير الإدارية</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
          <button className="btn btn-secondary" onClick={() => window.print()} style={{ gap: "8px", height: "45px", fontWeight: "bold" }}>
            <FaFilePdf style={{ color: "var(--accent-red)", fontSize: "16px" }} />
            تصدير كملف PDF
          </button>
          <button className="btn btn-secondary" onClick={exportToExcel} style={{ gap: "8px", height: "45px", fontWeight: "bold" }}>
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
