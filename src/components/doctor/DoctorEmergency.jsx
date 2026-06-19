import React from "react";

function DoctorEmergency({ activePatient, setActivePage }) {
  return (
    <div id="emergencyPage" className="page-content active">
      <div className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--border-color)", paddingBottom: "15px", marginBottom: "20px" }}>
        <div>
          <h2 style={{ color: "var(--accent-red)", margin: "0", fontSize: "22px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>🚨 لوحة التدخل السريع للطوارئ</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "13.5px" }}>بيانات إنقاذ الحياة الفورية للمواطن النشط</p>
        </div>
        <div style={{ background: "var(--accent-red)", color: "white", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontWeight: "bold", fontSize: "12.5px" }}>كشف طوارئ نشط</div>
      </div>

      <div className="box" style={{ padding: "20px", borderRight: "6px solid var(--accent-red)", marginBottom: "20px" }}>
        <h3 style={{ color: "var(--accent-red)", marginTop: "0", marginBottom: "18px", fontSize: "18px", fontWeight: "700" }}>اسم المواطن: <span style={{ color: "var(--text-dark)" }}>{activePatient.name}</span></h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ background: "#fff5f5", padding: "15px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #feb2b2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "15.5px", fontWeight: "700", color: "#9b2c2c", display: "block", marginBottom: "2px" }}>🩸 فصيلة الدم (Blood Group):</span>
              <span style={{ fontSize: "12px", color: "#c53030" }}>تستخدم فوراً لتأكيد نوع المتبرع ونقل الدم الإسعافي</span>
            </div>
            <div style={{ fontSize: "48px", fontWeight: "900", color: "var(--accent-red)", lineHeight: "1", fontFamily: "Outfit" }}>{activePatient.bloodType}</div>
          </div>
          
          <div style={{ background: "#fffdf5", padding: "15px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #fef08a" }}>
            <span style={{ fontSize: "15.5px", fontWeight: "700", color: "#854d0e", display: "block", marginBottom: "8px" }}>⚠️ تحذيرات الحساسية الدوائية الصارمة (Allergies):</span>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#b45309", padding: "10px 15px", background: "white", borderRadius: "var(--radius-sm)", borderRight: "4px solid var(--accent-amber)", boxShadow: "var(--shadow-sm)" }}>
              {activePatient.allergies}
            </div>
            <small style={{ color: "#92400e", display: "block", marginTop: "6px", fontWeight: "600", fontSize: "11.5px" }}>⛔ تحذير: يمنع إعطاء المريض أي مركبات كيميائية أو دوائية تحتوي على المادة المسببة للتحسس المذكورة أعلاه.</small>
          </div>
          
          <div style={{ background: "#f0f7ff", padding: "15px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #bfdbfe" }}>
            <span style={{ fontSize: "15.5px", fontWeight: "700", color: "#1e40af", display: "block", marginBottom: "8px" }}>🧠 الأمراض المزمنة الموثقة (Chronic Diseases):</span>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#1d4ed8", padding: "10px 15px", background: "white", borderRadius: "var(--radius-sm)", borderRight: "4px solid var(--secondary)", boxShadow: "var(--shadow-sm)" }}>
              {activePatient.chronicDiseases || "لا توجد أمراض مزمنة مسجلة"}
            </div>
            <small style={{ color: "#1e3a8a", display: "block", marginTop: "6px", fontWeight: "600", fontSize: "11.5px" }}>تنبيه: يجب مراعاة الأمراض المزمنة المسجلة أثناء التخدير أو التدخل الإسعافي.</small>
          </div>

        </div>
      </div>
      
      <div style={{ display: "flex", gap: "12px" }}>
        <button className="btn" onClick={() => setActivePage("patientsPage")} style={{ background: "var(--accent-red)", padding: "10px 20px", fontSize: "13.5px", fontWeight: "bold" }}>🔙 العودة لملف المريض الكامل</button>
        <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: "10px 20px", fontSize: "13.5px", fontWeight: "bold" }}>🖨️ طباعة تقرير الطوارئ فوراً</button>
      </div>
    </div>
  );
}

export default DoctorEmergency;
