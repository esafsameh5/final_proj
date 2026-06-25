import React from "react";

function DoctorSidebar({
  sidebarOpen,
  activePage,
  setActivePage,
  setSidebarOpen,
  setPdfOpen,
  showToast,
  handleOpenCurrentPatientFile,
  onLogout
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <h2 className="logo">
        <img src="/img/main_logo.png" alt="logo" style={{ width: "75px", height: "75px", objectFit: "contain" }} />
        الصحة الرقمية
      </h2>
      <a 
        className={`nav-link ${activePage === 'homePage' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('homePage'); 
          setSidebarOpen(false); 
          setPdfOpen(false); 
        }}
      >
        الرئيسية
      </a>
      <a 
        className="nav-link" 
        onClick={() => { 
          setActivePage('homePage'); 
          setSidebarOpen(false); 
          setPdfOpen(false); 
          setTimeout(() => document.querySelector('.topbar input')?.focus(), 150); 
        }}
      >
        البحث عن مريض
      </a>
      <a 
        className={`nav-link ${activePage === 'patientsPage' ? 'active' : ''}`} 
        onClick={handleOpenCurrentPatientFile}
      >
       المريض الحالي
      </a>
      <a 
        className={`nav-link ${activePage === 'testsPage' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('testsPage'); 
          setSidebarOpen(false); 
          setPdfOpen(false); 
        }}
      >
        التحاليل والأشعة
      </a>
      <a 
        className={`nav-link emergency-nav ${activePage === 'emergencyPage' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('emergencyPage'); 
          setSidebarOpen(false); 
          setPdfOpen(false); 
        }}
      >
        الطوارئ
      </a>
      <a 
        className={`nav-link ${activePage === 'settingsPage' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('settingsPage'); 
          setSidebarOpen(false); 
          setPdfOpen(false); 
        }}
      >
        الإعدادات
      </a>
      
      <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "10px 8px" }} />
      
      <a 
        className="nav-link logout-link" 
        onClick={onLogout}
      >
        تسجيل خروج
      </a>
    </aside>
  );
}

export default DoctorSidebar;
