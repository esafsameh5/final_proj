import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";


function PatientHome({ patients }) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientHomePage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>مرحبًا {patient.name} 👋</h2>
          <p>ملفك الطبي الموحد وبوابة صحتك الرقمية</p>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", background: "var(--primary-light)", padding: "6px 12px", borderRadius: "20px", border: "1.5px solid var(--border-color)" }}>
            Patient ID: <span style={{ fontFamily: "Outfit", fontWeight: "700", color: "var(--primary)" }}>{patient.id}</span>
          </span>
          <HeaderUserBadge name={patient.name} />
        </div>
      </div>

      {/* Medical Alerts Banner */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
        <div className="alert-box danger" style={{ margin: "0" }}>
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <h4 style={{ margin: "0 0 2px 0", fontWeight: "700" }}>حساسية شديدة مؤكدة</h4>
            <p style={{ margin: "0", fontSize: "12.5px" }}>لديك حساسية من {patient.allergies}. الرجاء إبلاغ أي منشأة صحية قبل تلقي العلاج.</p>
          </div>
        </div>
        <div className="alert-box warning" style={{ margin: "0" }}>
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <h4 style={{ margin: "0 0 2px 0", fontWeight: "700" }}>تحليل سكر تراكمي معلق</h4>
            <p style={{ margin: "0", fontSize: "12.5px" }}>آخر تحليل سكر تراكمي مسجل منذ 6 أشهر. يُنصح بإعادة التحليل للمتابعة.</p>
          </div>
        </div>
        <div className="alert-box info" style={{ margin: "0" }}>
          <span className="alert-icon">📅</span>
          <div className="alert-content">
            <h4 style={{ margin: "0 0 2px 0", fontWeight: "700" }}>موعد متابعة مقترح</h4>
            <p style={{ margin: "0", fontSize: "12.5px" }}>فحص دوري مقترح لعيادة الباطنة والسكري في غضون الشهر القادم.</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
        {/* Health Summary Card */}
        <div className="box">
          <h2>📋 ملخص حالتي الصحية (Health Summary)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "10px" }}>
              <span><b>🩸 فصيلة الدم:</b></span>
              <span style={{ fontWeight: "700", color: "var(--accent-red)", fontSize: "16px" }}>{patient.bloodType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "10px" }}>
              <span><b>🦠 الحساسية:</b></span>
              <span style={{ fontWeight: "600", color: "var(--accent-red)" }}>{patient.allergies}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "10px" }}>
              <span><b>🩺 الأمراض المزمنة:</b></span>
              <span style={{ fontWeight: "600", color: "var(--text-dark)", textAlign: "left" }}>{patient.chronicDiseases}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
              <span><b>📅 آخر زيارة طبية:</b></span>
              <span style={{ fontWeight: "600", fontFamily: "Outfit" }}>{patient.lastVisit}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="box">
          <h2>🕒 النشاط الأخير (Recent Activity)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
            <div style={{ display: "flex", gap: "12px", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>🧪</span>
              <div style={{ flex: "1" }}>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "14px" }}>آخر تحليل طبي مرفوع</h4>
                <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  {patient.labs[0]?.name || "تحليل صورة دم كاملة"} ({patient.labs[0]?.date || "2026/05/07"})
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>🩻</span>
              <div style={{ flex: "1" }}>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "14px" }}>آخر أشعة طبية مرفوعة</h4>
                <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  {patient.radiology[0]?.name || "أشعة صدر عادية"} ({patient.radiology[0]?.date || "2026/05/06"})
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", borderBottom: "1.5px solid var(--bg-main)", paddingBottom: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>💊</span>
              <div style={{ flex: "1" }}>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "14px" }}>آخر وصفة علاجية</h4>
                <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  {patient.prescriptions[0]?.name || "أملوديبين Amlodipine"} ({patient.prescriptions[0]?.date || "2026/05/07"})
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>🩺</span>
              <div style={{ flex: "1" }}>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "14px" }}>آخر تشخيص وزيارة طبيب</h4>
                <p style={{ margin: "0", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  {patient.visits[0]?.diagnosis || "التهاب بسيط في الجهاز التنفسي"} ({patient.visits[0]?.date || "2026/05/07"})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientHome;
