import React from "react";

function HospitalSidebar({
  sidebarOpen,
  activePage,
  setActivePage,
  setSidebarOpen,
  onLogout
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <h2 className="logo">
        <img 
          src="/img/main_logo.png" 
          alt="logo" 
          style={{ width: "75px", height: "75px", objectFit: "contain" }} 
        />
        الصحة الرقمية
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: "normal", marginTop: "-5px" }}>
          إدارة المستشفى
        </span>
      </h2>
      
      <a 
        className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('dashboard'); 
          setSidebarOpen(false); 
        }}
      >
        لوحة التحكم
      </a>
      
      <a 
        className={`nav-link ${activePage === 'departments' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('departments'); 
          setSidebarOpen(false); 
        }}
      >
        الأقسام
      </a>
      
      <a 
        className={`nav-link ${activePage === 'doctors' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('doctors'); 
          setSidebarOpen(false); 
        }}
      >
        الأطباء
      </a>
      
      <a 
        className={`nav-link ${activePage === 'inpatients' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('inpatients'); 
          setSidebarOpen(false); 
        }}
      >
        المرضى المقيمين
      </a>
      
      <a 
        className={`nav-link ${activePage === 'rooms' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('rooms'); 
          setSidebarOpen(false); 
        }}
      >
        الغرف والأسرة
      </a>
      
      <a 
        className={`nav-link ${activePage === 'operations' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('operations'); 
          setSidebarOpen(false); 
        }}
      >
        العمليات الجراحية
      </a>
      
      <a 
        className={`nav-link ${activePage === 'reports' ? 'active' : ''}`} 
        onClick={() => { 
          setActivePage('reports'); 
          setSidebarOpen(false); 
        }}
      >
        التقارير والإحصائيات
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

export default HospitalSidebar;
