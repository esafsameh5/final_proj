import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";

function PatientMedicalCard({ patients, showToast }) {
  const patient = patients["H-2026-001"];
  return (
    <div id="patientMedicalCardPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>💳 كارت الصحة الرقمية الذكي</h2>
          <p>بطاقتك الصحية الذكية ورموز مسح الهوية الطبية الفورية</p>
        </div>
        <HeaderUserBadge name={patient.name} />
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        {/* Visual NFC Card Representation */}
        <div className="box" style={{ background: "linear-gradient(135deg, #071b40 0%, #0c357a 100%)", color: "white", padding: "30px", borderRadius: "var(--radius-lg)", boxShadow: "0 10px 25px rgba(7, 27, 64, 0.25)", position: "relative", minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: "0 0 5px 0", color: "var(--accent-amber)", fontSize: "18px", fontWeight: "700" }}>الصحة الرقمية</h3>
              <p style={{ margin: "0", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>جمهورية مصر العربية</p>
            </div>
            <img src="/img/main_logo.png" alt="logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
          </div>
          
          <div style={{ fontSize: "18px", letterSpacing: "1px", fontFamily: "Outfit", margin: "25px 0 10px 0", fontWeight: "600" }}>
            NFC Card ID: NFC-882-991-A2
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "15px" }}>
            <div>
              <p style={{ margin: "0", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>اسم حامل البطاقة</p>
              <p style={{ margin: "3px 0 0 0", fontSize: "14px", fontWeight: "600" }}>أحمد محمد</p>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: "0", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>رقم الملف الطبي</p>
              <p style={{ margin: "3px 0 0 0", fontSize: "14px", fontFamily: "Outfit", fontWeight: "700" }}>H-2026-001</p>
            </div>
          </div>
        </div>

        {/* QR Code and Actions */}
        <div className="box" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", textAlign: "center" }}>
          <h3>رمز الاستجابة السريعة (QR Code) للملف</h3>
          
          <div style={{ background: "white", padding: "15px", borderRadius: "12px", border: "1.5px solid var(--border-color)", display: "inline-block", boxShadow: "var(--shadow-sm)" }}>
            <svg width="150" height="150" viewBox="0 0 29 29" shapeRendering="crispEdges">
              <path fill="#ffffff" d="M0,0 h29 v29 h-29 z" />
              <path fill="#0b3d91" d="M0,0 h7 v7 h-7 z M22,0 h7 v7 h-7 z M0,22 h7 v7 h-7 z M10,1 h1 v2 h-1 z M13,2 h2 v1 h-2 z M17,1 h1 v3 h-1 z M19,3 h1 v1 h-1 z M9,5 h2 v1 h-2 z M13,6 h1 v2 h-1 z M16,5 h3 v1 h-3 z M2,2 h3 v3 h-3 z M24,2 h3 v3 h-3 z M2,24 h3 v3 h-3 z M9,9 h2 v2 h-2 z M14,10 h2 v1 h-2 z M18,9 h3 v2 h-3 z M11,13 h3 v2 h-3 z M17,14 h2 v1 h-2 z M24,13 h2 v3 h-2 z M10,18 h2 v2 h-2 z M15,19 h3 v1 h-3 z M21,18 h2 v2 h-2 z M2,9 h4 v1 h-4 z M23,9 h2 v1 h-2 z M1,13 h2 v1 h-2 z M4,14 h2 v1 h-2 z M9,16 h2 v1 h-2 z M13,17 h2 v1 h-2 z M2,19 h3 v1 h-3 z M25,23 h3 v3 h-3 z" />
            </svg>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "12.5px", margin: "0", maxWidth: "280px" }}>يمكن لمزودي الرعاية الصحية مسح هذا الرمز للوصول الفوري لملفك الطبي الموحد.</p>
          
          <button type="button" className="btn" onClick={() => showToast("تم تحميل بطاقة الطوارئ بصيغة PDF بنجاح!", "success")} style={{ fontWeight: "bold", width: "100%", maxWidth: "280px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>📥 تحميل بطاقة الطوارئ PDF</button>
        </div>
      </div>
    </div>
  );
}

export default PatientMedicalCard;
