import React from "react";

function PatientSettings({ showToast }) {
  return (
    <div id="patientSettingsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>⚙️ إعدادات حساب المواطن</h2>
          <p>إدارة بيانات حسابك، تفضيلات الأمان، وإعدادات اللغة والخصوصية</p>
        </div>
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
        {/* Account Data Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>👤 بيانات الحساب الشخصية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div><b>الاسم الكامل:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>أحمد محمد</span></div>
            <div><b>البريد الإلكتروني:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600" }}>ahmed.mohamed@gmail.com</span></div>
            <div><b>الهاتف المحمول:</b> <span dir="ltr" style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600", display: "inline-block" }}>+20 100 123 4567</span></div>
            <div><b>رقم الملف الصحي الموحد:</b> <span style={{ fontFamily: "Outfit", color: "var(--primary)", fontWeight: "700" }}>H-2026-001</span></div>
          </div>
          
          <button type="button" className="btn" onClick={() => showToast("تم إرسال طلب تعديل البيانات للجهة المعتمدة بقيد المراجعة!", "info")} style={{ alignSelf: "flex-start", marginTop: "10px", fontWeight: "bold" }}>✏️ تعديل البيانات الشخصية</button>
        </div>

        {/* Password & Security Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🔒 تغيير كلمة المرور والأمن</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12.5px" }}>كلمة المرور الحالية:</label>
              <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "8px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
            </div>
            <div>
              <label style={{ fontSize: "12.5px" }}>كلمة المرور الجديدة:</label>
              <input type="password" placeholder="كلمة مرور قوية جديدة" style={{ width: "100%", padding: "8px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
          <button type="button" className="btn" onClick={() => showToast("تم تحديث كلمة المرور بنجاح!", "success")} style={{ alignSelf: "flex-start", fontWeight: "bold" }}>💾 تحديث كلمة المرور</button>
        </div>

        {/* Language Settings Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🌐 لغة الواجهة وتفضيلات العرض</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><b>لغة العرض الحالية:</b></span>
            <select style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", fontSize: "13px" }}>
              <option value="ar">العربية (Default)</option>
              <option value="en">English (الإنجليزية)</option>
            </select>
          </div>
        </div>

        {/* System Info Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>ℹ️ حول منصة الصحة الرقمية</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img src="/img/main_logo.png" alt="Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
            <div>
              <h4 style={{ margin: "0", color: "var(--primary)", fontSize: "15px", fontWeight: "700" }}>الصحة الرقمية (Digital Health)</h4>
              <p style={{ margin: "3px 0 0 0", color: "var(--text-muted)", fontSize: "12px" }}>الإصدار 1.0.0 (بوابة المواطن الموحدة)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientSettings;
