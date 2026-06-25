import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";


function PatientNotifications({ patients }) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientNotificationsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🔔 مركز الإشعارات والتنبيهات</h2>
          <p>تابع التحديثات والأنشطة الطبية الموثقة مؤخراً في ملفك الموحد</p>
        </div>
        <HeaderUserBadge name={patient.name} />
      </div>

      <div className="box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h2>الإشعارات الأخيرة</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "15px", padding: "15px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", background: "var(--primary-glow)", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>🧪</span>
            <div style={{ flex: "1" }}>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}>تم إضافة تحليل طبي جديد</h4>
              <p style={{ margin: "0", fontSize: "12.5px", color: "var(--text-dark)" }}>تم رفع نتيجة فحص ({patient.labs[0]?.name || "تحليل صورة دم كاملة CBC"}) لملفك بواسطة المختبر المعتمد.</p>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "Outfit" }}>{patient.labs[0]?.date || "2026/05/07"}</span>
          </div>

          <div style={{ display: "flex", gap: "15px", padding: "15px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", background: "white", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>💊</span>
            <div style={{ flex: "1" }}>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}>وصفة طبية جديدة معتمدة</h4>
              <p style={{ margin: "0", fontSize: "12.5px", color: "var(--text-dark)" }}>تم تسجيل وصفة دوائية جديدة ({patient.prescriptions[0]?.name || "أملوديبين Amlodipine"}) لملفك.</p>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "Outfit" }}>{patient.prescriptions[0]?.date || "2026/05/07"}</span>
          </div>

          <div style={{ display: "flex", gap: "15px", padding: "15px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", background: "white", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>📋</span>
            <div style={{ flex: "1" }}>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}>تحديث الملف الطبي الموحد</h4>
              <p style={{ margin: "0", fontSize: "12.5px", color: "var(--text-dark)" }}>تم تحديث سجل الزيارات والتشخيصات العامة في ملفك الطبي الموحد.</p>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "Outfit" }}>{patient.lastVisit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientNotifications;
