import React from "react";
import { FiHome, FiUser, FiActivity } from "react-icons/fi";

function GlobalNavbar({
  activeHeaderTab,
  setActiveHeaderTab,
  activeDashboard,
  setActiveDashboard,
  setPatientActivePage,
  setActivePage
}) {
  return (
    <header className="global-navbar">
      <div className="logo-area">
        <img src="/img/main_logo.png" alt="logo" style={{ width: "35px", height: "35px", objectFit: "contain" }} />
        <span>الصحة الرقمية</span>
      </div>
      <div className="nav-links">
        <button 
          className={activeHeaderTab === "home" ? "active" : ""} 
          onClick={() => { 
            setActiveHeaderTab("home"); 
            setActiveDashboard("portal"); 
          }}
        >
          <FiHome style={{ marginLeft: "5px" }} /> الرئيسية
        </button>
        <button 
          className={activeDashboard === "patient" && activeHeaderTab !== "home" ? "active" : ""} 
          onClick={() => { 
            setActiveDashboard("patient"); 
            setActiveHeaderTab("patient"); 
            setPatientActivePage("homePage"); 
          }}
        >
          <FiUser style={{ marginLeft: "5px" }} /> المريض
        </button>
        <button 
          className={activeDashboard === "doctor" && activeHeaderTab !== "home" ? "active" : ""} 
          onClick={() => { 
            setActiveDashboard("doctor"); 
            setActiveHeaderTab("doctor"); 
            setActivePage("homePage"); 
          }}
        >
          <FiActivity style={{ marginLeft: "5px" }} /> الدكتور
        </button>
      </div>
    </header>
  );
}

export default GlobalNavbar;
