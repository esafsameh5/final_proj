import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";

function PatientEmergency({ patients, hasUnread, unreadCount }) {
  const patientId = sessionStorage.getItem("userId") || "H-2026-001";
  const patient = patients[patientId] || patients["H-2026-001"];

  const hasPenicillinAllergy = () => {
    if (!patient) return false;
    
    // 1. Check structured allergies list first
    if (Array.isArray(patient.allergiesList) && patient.allergiesList.length > 0) {
      return patient.allergiesList.some(a => {
        const name = String(a.name || a.allergyName || "").toLowerCase().trim();
        return name.includes("penicillin") || name.includes("بنسلين");
      });
    }
    
    // 2. Fall back to checking the joined allergies string
    if (patient.allergies && typeof patient.allergies === "string") {
      const lower = patient.allergies.toLowerCase();
      return lower.includes("penicillin") || lower.includes("بنسلين");
    }
    
    return false;
  };

  return (
    <div id="patientEmergencyPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🚨 البيانات الطبية للحالات الطارئة</h2>
          <p>ملخص فوري مخصص للمسعفين وأطباء الطوارئ للتعامل السريع</p>
        </div>
        <HeaderUserBadge name={patient.name} badgeCount={unreadCount} hasUnread={hasUnread} />
      </div>

      <div className="emergency-container">
        <div className="emergency-header">
          <span className="emergency-icon">🚨</span>
          <div>
            <h2 className="emergency-title">حالة طوارئ طبية (Emergency Profile)</h2>
            <p className="emergency-subtitle">الرجاء مراجعة البيانات الحيوية للمريض {patient.name || "أحمد محمد"}</p>
          </div>
        </div>

        <div className="emergency-grid">
          <div className="emergency-card highlight-red">
            <h3 className="emergency-card-title">🩸 فصيلة الدم</h3>
            <div className="emergency-card-value blood-type">{patient.bloodType}</div>
            <small className="emergency-card-hint">لا تعطي فصيلة دم أخرى إلا بعد اختبار التطابق.</small>
          </div>

          <div className="emergency-card highlight-red">
            <h3 className="emergency-card-title">🦠 الحساسية الشديدة</h3>
            <div className="emergency-card-value allergy-info">{patient.allergies}</div>
            {hasPenicillinAllergy() && (
              <small className="emergency-card-hint">ممنوع تماماً حقن البنسلين أو مشتقاته.</small>
            )}
          </div>

          <div className="emergency-card full-width">
            <h3 className="emergency-card-title highlight-primary">🩺 الأمراض المزمنة الحالية</h3>
            <div className="emergency-card-text">{patient.chronicDiseases}</div>
          </div>
        </div>

        <div className="emergency-contacts-section">
          <h3 className="contacts-title">📞 أرقام الاتصال والتواصل للطوارئ</h3>
          <div className="emergency-contacts-grid">
            <div className="contact-item">
              <span className="contact-label"><b>🚑 رقم الإسعاف الوطني:</b></span>
              <span className="contact-value red-text">123</span>
            </div>
            <div className="contact-item">
              <span className="contact-label"><b>🏥 رقم طوارئ الصحة:</b></span>
              <span className="contact-value primary-text">137</span>
            </div>
            {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
              patient.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="contact-item full-width personal-contact">
                  <span className="contact-label"><b>👤 {contact.relation || "جهة اتصال"}:</b></span>
                  <span className="contact-value name-phone">
                    {contact.name} 
                    {contact.phone && <span dir="ltr" className="phone-number"> ({contact.phone})</span>}
                  </span>
                </div>
              ))
            ) : (
              <div className="contact-item full-width personal-contact" style={{ textAlign: "center", color: "var(--text-muted)", padding: "10px 0" }}>
                لا توجد جهات اتصال للطوارئ مسجلة.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientEmergency;
