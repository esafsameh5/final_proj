import React from "react";

function PatientEmergency({ patients }) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientEmergencyPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🚨 البيانات الطبية للحالات الطارئة</h2>
          <p>ملخص فوري مخصص للمسعفين وأطباء الطوارئ للتعامل السريع</p>
        </div>
      </div>

      <div className="box" style={{ border: "2px solid var(--accent-red)", background: "rgba(239, 68, 68, 0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", borderBottom: "2px solid var(--accent-red-light)", paddingBottom: "15px" }}>
          <span style={{ fontSize: "32px" }}>🚨</span>
          <div>
            <h2 style={{ color: "var(--accent-red)", margin: "0" }}>حالة طوارئ طبية (Emergency Profile)</h2>
            <p style={{ margin: "2px 0 0 0", color: "var(--text-muted)", fontSize: "13px" }}>الرجاء مراجعة البيانات الحيوية للمريض أحمد محمد</p>
          </div>
        </div>

        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginTop: "20px" }}>
          
          <div style={{ background: "white", padding: "20px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 style={{ margin: "0", color: "var(--accent-red)", fontSize: "16px", fontWeight: "700" }}>🩸 فصيلة الدم</h3>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-red)" }}>{patient.bloodType}</div>
            <small style={{ color: "var(--text-muted)" }}>لا تعطي فصيلة دم أخرى إلا بعد اختبار التطابق.</small>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 style={{ margin: "0", color: "var(--accent-red)", fontSize: "16px", fontWeight: "700" }}>🦠 الحساسية الشديدة</h3>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent-red)" }}>{patient.allergies}</div>
            <small style={{ color: "var(--text-muted)" }}>ممنوع تماماً حقن البنسلين أو مشتقاته.</small>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "10px", gridColumn: "span 2" }}>
            <h3 style={{ margin: "0", color: "var(--primary)", fontSize: "16px", fontWeight: "700" }}>🩺 الأمراض المزمنة الحالية</h3>
            <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-dark)" }}>{patient.chronicDiseases}</div>
          </div>
        </div>

        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1.5px solid var(--accent-red-light)" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "var(--primary)", fontSize: "16px", fontWeight: "700" }}>📞 أرقام الاتصال والتواصل للطوارئ</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
            <div style={{ background: "white", padding: "12px 18px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span><b>🚑 رقم الإسعاف الوطني:</b></span>
              <span style={{ color: "var(--accent-red)", fontWeight: "bold", fontSize: "16px", fontFamily: "Outfit" }}>123</span>
            </div>
            <div style={{ background: "white", padding: "12px 18px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span><b>🏥 رقم طوارئ الصحة:</b></span>
              <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "16px", fontFamily: "Outfit" }}>137</span>
            </div>
            <div style={{ background: "white", padding: "12px 18px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", gridColumn: "span 2" }}>
              <span><b>👤 جهة الاتصال الشخصية (الزوجة):</b></span>
              <span style={{ fontWeight: "600" }}>سارة أحمد <span dir="ltr" style={{ fontFamily: "Outfit", display: "inline-block", marginRight: "5px" }}>(+20 111 222 3333)</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientEmergency;
