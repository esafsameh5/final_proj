import React from "react";

function PatientSidebar({
  sidebarOpen,
  setSidebarOpen,
  patientActivePage,
  setPatientActivePage,
  onLogout
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <h2 className="logo">
        <img src="/img/main_logo.png" alt="logo" style={{ width: "75px", height: "75px", objectFit: "contain" }} />
        الصحة الرقمية
      </h2>
      <a className={`nav-link ${patientActivePage === 'homePage' ? 'active' : ''}`} onClick={() => { setPatientActivePage('homePage'); setSidebarOpen(false); }}>الرئيسية</a>
      <a className={`nav-link ${patientActivePage === 'healthProfile' ? 'active' : ''}`} onClick={() => { setPatientActivePage('healthProfile'); setSidebarOpen(false); }}>ملفي الصحي</a>
      <a className={`nav-link ${patientActivePage === 'labs' ? 'active' : ''}`} onClick={() => { setPatientActivePage('labs'); setSidebarOpen(false); }}>التحاليل</a>
      <a className={`nav-link ${patientActivePage === 'radiology' ? 'active' : ''}`} onClick={() => { setPatientActivePage('radiology'); setSidebarOpen(false); }}>الأشعة</a>
      <a className={`nav-link ${patientActivePage === 'prescriptions' ? 'active' : ''}`} onClick={() => { setPatientActivePage('prescriptions'); setSidebarOpen(false); }}>الوصفات الطبية</a>
      <a className={`nav-link ${patientActivePage === 'medicalCard' ? 'active' : ''}`} onClick={() => { setPatientActivePage('medicalCard'); setSidebarOpen(false); }}>كارت الصحة الرقمية</a>
      <a className={`nav-link emergency-nav ${patientActivePage === 'emergency' ? 'active' : ''}`} onClick={() => { setPatientActivePage('emergency'); setSidebarOpen(false); }}>الطوارئ</a>
      <a className={`nav-link ${patientActivePage === 'notifications' ? 'active' : ''}`} onClick={() => { setPatientActivePage('notifications'); setSidebarOpen(false); }}>الإشعارات</a>
      <a className={`nav-link ${patientActivePage === 'settings' ? 'active' : ''}`} onClick={() => { setPatientActivePage('settings'); setSidebarOpen(false); }}>الإعدادات</a>
      <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "10px 8px" }} />
      <a className="nav-link logout-link" onClick={onLogout}>تسجيل خروج</a>
    </aside>
  );
}

export default PatientSidebar;
