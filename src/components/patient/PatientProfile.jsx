import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";

const GOVERNORATE_NAMES_AR = {
  "cairo": "القاهرة",
  "giza": "الجيزة",
  "alexandria": "الإسكندرية",
  "qalyubia": "القليوبية",
  "sharqia": "الشرقية",
  "dakahlia": "الدقهلية",
  "beheira": "البحيرة",
  "gharbia": "الغربية",
  "monufia": "المنوفية",
  "kafrelsheikh": "كفر الشيخ",
  "damietta": "دمياط",
  "portsaid": "بورسعيد",
  "ismailia": "الإسماعيلية",
  "suez": "السويس",
  "fayoum": "الفيوم",
  "benisuef": "بني سويف",
  "minya": "المنيا",
  "assiut": "أسيوط",
  "sohag": "سوهاج",
  "qena": "قنا",
  "luxor": "الأقصر",
  "aswan": "أسوان",
  "redsea": "البحر الأحمر",
  "newvalley": "الوادي الجديد",
  "matrouh": "مطروح",
  "northsinai": "شمال سيناء",
  "southsinai": "جنوب سيناء",
  "1": "القاهرة",
  "2": "الجيزة",
  "3": "الإسكندرية",
  "4": "القليوبية",
  "5": "الشرقية",
  "6": "الدقهلية",
  "7": "البحيرة",
  "8": "الغربية",
  "9": "المنوفية",
  "10": "كفر الشيخ",
  "11": "دمياط",
  "12": "بورسعيد",
  "13": "الإسماعيلية",
  "14": "السويس",
  "15": "الفيوم",
  "16": "بني سويف",
  "17": "المنيا",
  "18": "أسيوط",
  "19": "سوهاج",
  "20": "قنا",
  "21": "الأقصر",
  "22": "أسوان",
  "23": "البحر الأحمر",
  "24": "الوادي الجديد",
  "25": "مطروح",
  "26": "شمال سيناء",
  "27": "جنوب سيناء"
};

function PatientProfile({ patients, hasUnread, unreadCount }) {
  const patientId = sessionStorage.getItem("userId") || "H-2026-001";
  const patient = patients[patientId] || patients["H-2026-001"];

  const formatArabicDate = (dateStr) => {
    if (!dateStr) return "غير متوفر";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "غير متوفر";
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "غير متوفر";
    }
  };

  if (!patient) {
    return (
      <div id="patientProfilePage" className="page-content active" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <p>لم يتم العثور على بيانات المريض.</p>
      </div>
    );
  }

  return (
    <div id="patientProfilePage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>📋 ملفي الصحي الكامل</h2>
          <p>التفاصيل الديموغرافية والبيانات العلاجية الموثقة في ملفك الموحد</p>
        </div>
        <HeaderUserBadge name={patient.name} badgeCount={unreadCount} hasUnread={hasUnread} />
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
        {/* Basic Info Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h2>👤 البيانات الأساسية والديموغرافية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div><b>الاسم الكامل:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>{patient.name}</span></div>
            <div><b>رقم الهوية الصحية (Health ID):</b> <span style={{ fontFamily: "Outfit", color: "var(--primary)", fontWeight: "700" }}>{patient.healthId || "غير متوفر"}</span></div>
            <div><b>حالة قفل الملف:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>{patient.isLocked ? "نعم" : "لا"}</span></div>
            <div><b>المحافظة:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>{GOVERNORATE_NAMES_AR[String(patient.governorate).toLowerCase()] || "غير محدد"}</span></div>
            <div><b>تاريخ آخر تحديث للملف:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>{formatArabicDate(patient.lastUpdatedAt)}</span></div>
            <div><b>العمر:</b> <span style={{ color: "var(--text-dark)", fontWeight: "600" }}>{patient.age} سنة</span></div>
            <div><b>الرقم القومي:</b> <span style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600" }}>{patient.nationalNumber || "29105070102345"}</span></div>
            <div><b>رقم الهاتف:</b> <span dir="ltr" style={{ fontFamily: "Outfit", color: "var(--text-dark)", fontWeight: "600", display: "inline-block" }}>{patient.phone || "+20 100 123 4567"}</span></div>
            <div><b>فصيلة الدم:</b> <span style={{ fontWeight: "700", color: "var(--accent-red)" }}>{patient.bloodType}</span></div>
          </div>
        </div>

        {/* Medical Summary Card */}
        <div className="box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h2>🛡️ الملاحظات والتحذيرات الطبية</h2>
          
          <h3 style={{ margin: "0 0 5px 0", color: "var(--primary)", fontSize: "15px", fontWeight: "700" }}>🚨 ملخص الطوارئ الحرج</h3>
          <p style={{ margin: "0 0 15px 0", fontSize: "13.5px", color: "var(--text-dark)", fontWeight: "600", padding: "10px", background: "rgba(239, 68, 68, 0.05)", borderRight: "3px solid var(--accent-red)", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
            {patient.emergencySummary || "لا يوجد ملخص طوارئ حرج مسجل حالياً."}
          </p>
          
          <h3 style={{ margin: "15px 0 5px 0", color: "var(--primary)", fontSize: "15px", fontWeight: "700", borderTop: "1.5px solid var(--bg-main)", paddingTop: "15px" }}>🦠 الحساسية المسجلة</h3>
          <p style={{ margin: "0", fontSize: "13.5px", color: "var(--accent-red)", fontWeight: "600" }}>{patient.allergies}</p>

          <h3 style={{ margin: "15px 0 5px 0", color: "var(--primary)", fontSize: "15px", fontWeight: "700", borderTop: "1.5px solid var(--bg-main)", paddingTop: "15px" }}>🩺 الأمراض المزمنة</h3>
          <p style={{ margin: "0", fontSize: "13.5px", color: "var(--text-dark)", fontWeight: "600" }}>{patient.chronicDiseases}</p>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
