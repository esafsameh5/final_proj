import React from "react";

function MinistrySidebar({ sidebarOpen, activePage, setActivePage, setSidebarOpen, onLogout }) {
  const links = [
    { id: "dashboard", label: "الرئيسية" },
    { id: "hospitals", label: "المستشفيات" },
    { id: "doctors", label: "الأطباء" },
    { id: "departments", label: "الأقسام" },
    { id: "reports", label: "التقارير" },
  ];

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
          إدارة الوزارة
        </span>
      </h2>

      {links.map((link) => (
        <a
          key={link.id}
          className={`nav-link ${activePage === link.id ? "active" : ""}`}
          onClick={() => {
            setActivePage(link.id);
            setSidebarOpen(false);
          }}
        >
          {link.label}
        </a>
      ))}

      <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)", margin: "10px 8px" }} />

      <a className="nav-link logout-link" onClick={onLogout}>
        تسجيل خروج
      </a>
    </aside>
  );
}

export default MinistrySidebar;
