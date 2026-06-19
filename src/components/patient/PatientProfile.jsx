import React from "react";

function PatientProfile({ patients }) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientProfilePage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>📋 ملفي الصحي الكامل</h2>
          <p>التفاصيل الديموغرافية والخط الزمني لتاريخك العلاجي الموثق</p>
        </div>
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
        {/* Basic Info Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h2>👤 البيانات الأساسية والديموغرافية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div><b>الاسم الكامل:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>أحمد محمد</span></div>
            <div><b>العمر:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>35 سنة (تاريخ الميلاد: 1991/05/07)</span></div>
            <div><b>الرقم القومي:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600" }}>29105070102345</span></div>
            <div><b>رقم الهاتف:</b> <span dir="ltr" style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600", display: "inline-block" }}>+20 100 123 4567</span></div>
            <div><b>فصيلة الدم:</b> <span style={{ fontWeight: "700", color: "var(--accent-red)" }}>{patient.bloodType}</span></div>
          </div>
          
          <h3 style={{ margin: "15px 0 5px 0", color: "var(--primary)", fontSize: "15px", fontWeight: "700", borderTop: "1.5px solid var(--bg-main)", paddingTop: "15px" }}>🦠 الحساسية المسجلة</h3>
          <p style={{ margin: "0", fontSize: "13.5px", color: "var(--accent-red)", fontWeight: "600" }}>{patient.allergies}</p>

          <h3 style={{ margin: "15px 0 5px 0", color: "var(--primary)", fontSize: "15px", fontWeight: "700", borderTop: "1.5px solid var(--bg-main)", paddingTop: "15px" }}>🩺 الأمراض المزمنة</h3>
          <p style={{ margin: "0", fontSize: "13.5px", color: "var(--text-dark)", fontWeight: "600" }}>{patient.chronicDiseases}</p>
        </div>

        {/* Medical Timeline Card */}
        <div className="box">
          <h2>⏳ السجل الزمني الطبي (Medical Timeline)</h2>
          <div className="timeline" style={{ position: "relative", paddingRight: "20px", marginTop: "20px" }}>
            <div style={{ position: "absolute", right: "8px", top: "0", bottom: "0", width: "2px", background: "var(--border-color)" }}></div>
            {patient.timeline.map((item, idx) => (
              <div key={idx} style={{ position: "relative", marginBottom: "20px", paddingRight: "15px" }}>
                <span style={{ position: "absolute", right: "-18px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: "white", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", zIndex: "1" }}>{item.icon}</span>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)", fontFamily: "Outfit", marginBottom: "2px" }}>{item.year}</div>
                <div style={{ fontSize: "13px", color: "var(--text-dark)", fontWeight: "500" }}>{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
