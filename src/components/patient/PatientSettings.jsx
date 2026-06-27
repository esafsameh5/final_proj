import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";
import api, { clearSession } from "../../utils/api";

function PatientSettings({ patients, showToast, onLogout, hasUnread, unreadCount }) {
  const patientId = sessionStorage.getItem("userId") || "H-2026-001";
  const patient = patients[patientId] || patients["H-2026-001"];

  return (
    <div
      id="patientSettingsPage"
      className="page-content active"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      <div className="topbar">
        <div>
          <h2>⚙️ إعدادات حساب المواطن</h2>
          <p>إدارة بيانات حسابك، تفضيلات الأمان، وإعدادات العرض الأساسية</p>
        </div>
        <HeaderUserBadge name={patient.name} badgeCount={unreadCount} hasUnread={hasUnread} />
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>👤 بيانات الحساب الشخصية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div><b>الاسم الكامل:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>{patient.name}</span></div>
            <div><b>البريد الإلكتروني:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600" }}>{patient.email || "غير متوفر"}</span></div>
            <div><b>الهاتف المحمول:</b> <span dir="ltr" style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600", display: "inline-block" }}>{patient.phone || "غير متوفر"}</span></div>
            <div><b>رقم الملف الصحي الموحد:</b> <span style={{ fontFamily: "Outfit", color: "var(--primary)", fontWeight: "700" }}>{patient.id}</span></div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => showToast("تم إرسال طلب تعديل البيانات للجهة المعتمدة بقيد المراجعة!", "info")}
            style={{ alignSelf: "flex-start", marginTop: "10px", fontWeight: "bold" }}
          >
            ✏️ تعديل البيانات الشخصية
          </button>
        </div>

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
          <button
            type="button"
            className="btn"
            onClick={() => showToast("تم تحديث كلمة المرور بنجاح!", "success")}
            style={{ alignSelf: "flex-start", fontWeight: "bold" }}
          >
            💾 تحديث كلمة المرور
          </button>
        </div>

        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2>🔒 الأمان وإدارة الجلسات</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <span><b>حالة الحساب:</b></span>
              <span style={{ background: "var(--accent-emerald-light)", color: "#065f46", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "12px" }}>
                🟢 الحساب نشط
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              try {
                await api.post("/api/v1/auth/logout-all");
                showToast("تم تسجيل الخروج بنجاح من جميع الأجهزة", "success");
                clearSession();
                if (onLogout) onLogout();
              } catch (err) {
                const msg = err.response?.data?.message || "فشل تسجيل الخروج من جميع الأجهزة";
                showToast(msg, "danger");
              }
            }}
            style={{ alignSelf: "flex-start", fontWeight: "bold", background: "rgba(239, 68, 68, 0.1)", color: "var(--accent-red)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
          >
            🚪 خروج من جميع الأجهزة
          </button>
        </div>

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
