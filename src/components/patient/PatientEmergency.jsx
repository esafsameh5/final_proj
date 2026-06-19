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
            <small className="emergency-card-hint">ممنوع تماماً حقن البنسلين أو مشتقاته.</small>
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
            <div className="contact-item full-width personal-contact">
              <span className="contact-label"><b>👤 جهة الاتصال الشخصية (الزوجة):</b></span>
              <span className="contact-value name-phone">
                سارة أحمد 
                <span dir="ltr" className="phone-number">(+20 111 222 3333)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientEmergency;
