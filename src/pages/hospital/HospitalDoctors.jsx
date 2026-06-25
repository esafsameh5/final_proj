import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

import { 
  FaUserDoctor, 
  FaUserGroup, 
  FaStethoscope, 
  FaStar, 
  FaCrown, 
  FaBuildingShield, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaFilter, 
  FaChevronDown, 
  FaSun, 
  FaMoon, 
  FaRegBell,
  FaShieldHalved,
  FaCircleStop,
  FaIdCard,
  FaTrashCan,
  FaLock,
  FaLockOpen,
  FaHourglassHalf
} from "react-icons/fa6";
import { initialDoctorsData } from "../../data/hospital/doctors";
import { initialDepartmentsData } from "../../data/hospital/departments";
import ConfirmModal from "../../components/common/ConfirmModal";

function HospitalDoctors({ showToast }) {
  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem("hospital_doctors");
    return saved ? JSON.parse(saved) : initialDoctorsData;
  });

  useEffect(() => {
    localStorage.setItem("hospital_doctors", JSON.stringify(doctors));
  }, [doctors]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("كل الأقسام");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  });

  // New Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    department: "",
    specialty: "",
    phone: "",
    shift: "morning",
    role: "doctor",
    digitalAccountStatus: "pending"
  });

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.includes(searchTerm) || doc.phone.includes(searchTerm);
    const matchesDept = selectedDept === "كل الأقسام" || doc.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Role translating helper
  const getRoleArabic = (role) => {
    switch (role) {
      case "doctor": return "طبيب";
      case "specialist": return "أخصائي";
      case "consultant": return "استشاري";
      case "dept_head": return "رئيس قسم";
      case "chief": return "رئيس الأطباء";
      default: return "طبيب";
    }
  };

  // Shift translating helper
  const getShiftArabic = (shift) => {
    switch (shift) {
      case "morning": return "صباحية";
      case "evening": return "مسائية";
      case "night": return "ليلية";
      default: return "صباحية";
    }
  };

  // Digital Account Status helper
  const getDigitalStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="status" style={{ background: "var(--accent-emerald-light)", color: "#065f46" }}>مفعل</span>;
      case "pending":
        return <span className="status" style={{ background: "var(--accent-amber-light)", color: "#92400e" }}>قيد التفعيل</span>;
      case "inactive":
        return <span className="danger" style={{ background: "var(--accent-red-light)", color: "#991b1b" }}>غير مفعل</span>;
      default:
        return <span className="status" style={{ background: "var(--accent-amber-light)", color: "#92400e" }}>قيد التفعيل</span>;
    }
  };

  // Handlers for Row Actions
  const handleUpdateRole = (id, newRole) => {
    let docName = "";
    setDoctors(prev => prev.map(d => {
      if (d.id === id) {
        docName = d.name;
        return { ...d, role: newRole };
      }
      return d;
    }));
    setActiveDropdownId(null);
    showToast?.(`تم تحديث الدور الوظيفي للطبيب ${docName} إلى: ${getRoleArabic(newRole)}.`, "success");
  };

  const handleUpdateDigitalStatus = (id, newStatus) => {
    let docName = "";
    setDoctors(prev => prev.map(d => {
      if (d.id === id) {
        docName = d.name;
        return { ...d, digitalAccountStatus: newStatus };
      }
      return d;
    }));
    setActiveDropdownId(null);
    const statusAr = newStatus === 'active' ? 'مفعل' : newStatus === 'pending' ? 'قيد التفعيل' : 'غير مفعل';
    showToast?.(`تم تحديث حالة الحساب الرقمي للطبيب ${docName} إلى: ${statusAr}.`, "success");
  };

  const handleToggleActive = (id) => {
    let docName = "";
    let isSuspended = false;
    setDoctors(prev => prev.map(d => {
      if (d.id === id) {
        const newStatus = d.status === "active" ? "suspended" : "active";
        docName = d.name;
        isSuspended = newStatus === "suspended";
        return { ...d, status: newStatus };
      }
      return d;
    }));
    setActiveDropdownId(null);
    showToast?.(`تم تحديث حالة الطبيب ${docName} إلى: ${isSuspended ? "موقوف 🔴" : "نشط 🟢"}.`, "success");
  };

  const handleDeleteDoctor = (id) => {
    const docToDelete = doctors.find(d => d.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف الطبيب",
      message: `هل أنت متأكد من حذف الطبيب (${docToDelete?.name || ''}) نهائياً من السجل الطبي للمستشفى؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setDoctors(prev => prev.filter(d => d.id !== id));
        showToast?.(`تم حذف الطبيب ${docToDelete?.name || ''} من السجل بنجاح.`, "success");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  // Add new doctor
  const handleAddDoctorSubmit = (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.department || !newDoctor.specialty || !newDoctor.phone) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
    const doctorToAdd = {
      id: newId,
      name: newDoctor.name.startsWith("د.") ? newDoctor.name : "د. " + newDoctor.name,
      department: newDoctor.department,
      specialty: newDoctor.specialty,
      phone: newDoctor.phone,
      status: "active",
      shift: newDoctor.shift,
      role: newDoctor.role,
      digitalAccountStatus: newDoctor.digitalAccountStatus
    };

    setDoctors(prev => [...prev, doctorToAdd]);
    setIsModalOpen(false);
    showToast?.(`تم إضافة الطبيب ${doctorToAdd.name} بنجاح.`, "success");
    // Reset form
    setNewDoctor({
      name: "",
      department: "",
      specialty: "",
      phone: "",
      shift: "morning",
      role: "doctor",
      digitalAccountStatus: "pending"
    });
  };

  return (
    <div id="hospitalDoctorsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>الأطباء والكوادر 🩺</h2>
          <p>إدارة سجل الأطباء، وتحديد التخصصات، والمناوبات، وحسابات الصحة الرقمية</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Tools Section */}
      <div className="filters-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", smWidth: "auto", flex: 1 }}>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus style={{ marginLeft: "5px" }} />
            إضافة طبيب
          </button>
          
          <div style={{ position: "relative", minWidth: "160px" }}>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ paddingRight: "35px", cursor: "pointer", background: "white" }}
            >
              <option value="كل الأقسام">كل الأقسام</option>
              {initialDepartmentsData.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <FaFilter style={{ 
              position: "absolute", 
              right: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)",
              fontSize: "11px",
              pointerEvents: "none"
            }} />
          </div>
        </div>

        <div className="topbar-search-group" style={{ margin: 0, width: "320px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input 
              type="text" 
              placeholder="بحث عن طبيب..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", paddingRight: "40px" }}
            />
            <FaMagnifyingGlass style={{ 
              position: "absolute", 
              right: "15px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)" 
            }} />
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "15px", marginBottom: "25px" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>إجمالي الأطباء</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.length}</p>
          <span style={{ display: "inline-flex", background: "var(--primary-glow)", color: "var(--primary)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaUserGroup />
          </span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>الأطباء العامين</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.filter(d => d.role === "doctor").length}</p>
          <span style={{ display: "inline-flex", background: "var(--primary-glow)", color: "var(--secondary)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaUserDoctor />
          </span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>الأخصائيون</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.filter(d => d.role === "specialist").length}</p>
          <span style={{ display: "inline-flex", background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaStethoscope />
          </span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>الاستشاريون</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.filter(d => d.role === "consultant").length}</p>
          <span style={{ display: "inline-flex", background: "rgba(139, 92, 246, 0.08)", color: "var(--accent-purple)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaStar />
          </span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>رؤساء الأقسام</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.filter(d => d.role === "dept_head").length}</p>
          <span style={{ display: "inline-flex", background: "rgba(245, 158, 11, 0.08)", color: "var(--accent-amber)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaCrown />
          </span>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>رئيس الأطباء</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.filter(d => d.role === "chief").length}</p>
          <span style={{ display: "inline-flex", background: "rgba(239, 68, 68, 0.08)", color: "var(--accent-red)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaBuildingShield />
          </span>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="box" style={{ overflow: "visible" }}>
        <h2>سجل الكادر الطبي</h2>
        <div className="table-container">
          <table style={{ overflow: "visible" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "60px" }}>#</th>
                <th style={{ textAlign: "right" }}>اسم الطبيب</th>
                <th style={{ textAlign: "right" }}>القسم</th>
                <th style={{ textAlign: "right" }}>التخصص</th>
                <th style={{ textAlign: "center" }}>رقم الهاتف</th>
                <th style={{ textAlign: "center" }}>المناوبة</th>
                <th style={{ textAlign: "center" }}>الصلاحية</th>
                <th style={{ textAlign: "center" }}>الحساب الرقمي</th>
                <th style={{ textAlign: "center" }}>حالة العمل</th>
                <th style={{ textAlign: "center", width: "100px" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc, idx) => (
                <tr key={doc.id}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>
                  <td style={{ textAlign: "right", fontWeight: "700" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "50%", 
                        background: "var(--primary-light)", 
                        color: "var(--primary)", 
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px"
                      }}>
                        {doc.name.replace("د. ", "").charAt(0)}
                      </div>
                      <span style={{ color: "var(--primary)" }}>{doc.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-dark)", fontWeight: "600" }}>{doc.department}</td>
                  <td style={{ textAlign: "right", color: "var(--text-muted)" }}>{doc.specialty}</td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{doc.phone}</td>
                  <td style={{ textAlign: "center" }}>
                    {doc.shift === "morning" && (
                      <span className="status" style={{ background: "var(--accent-amber-light)", color: "#92400e", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FaSun style={{ fontSize: "10px" }} /> صباحية
                      </span>
                    )}
                    {doc.shift === "evening" && (
                      <span className="status" style={{ background: "rgba(139, 92, 246, 0.08)", color: "var(--accent-purple)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FaMoon style={{ fontSize: "10px" }} /> مسائية
                      </span>
                    )}
                    {doc.shift === "night" && (
                      <span className="status" style={{ background: "var(--primary-light)", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FaMoon style={{ fontSize: "10px" }} /> ليلية
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="status" style={{ 
                      background: doc.role === "chief" ? "var(--accent-red-light)" : doc.role === "dept_head" ? "var(--accent-amber-light)" : "var(--primary-light)", 
                      color: doc.role === "chief" ? "#991b1b" : doc.role === "dept_head" ? "#92400e" : "var(--primary)",
                      fontWeight: "bold"
                    }}>
                      {getRoleArabic(doc.role)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {getDigitalStatusBadge(doc.digitalAccountStatus)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {doc.status === "active" ? (
                      <span className="status" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)" }}>نشط</span>
                    ) : (
                      <span className="danger" style={{ background: "rgba(239, 68, 68, 0.08)", color: "var(--accent-red)" }}>موقوف</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", position: "relative" }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === doc.id ? null : doc.id);
                      }}
                      style={{ padding: "6px 14px", fontWeight: "bold" }}
                    >
                      إدارة <FaChevronDown style={{ fontSize: "8px", marginRight: "4px" }} />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    {activeDropdownId === doc.id && (
                      <>
                        <div 
                          style={{ position: "fixed", inset: 0, zIndex: 90 }} 
                          onClick={() => setActiveDropdownId(null)}
                        ></div>
                        <div style={{
                          position: "absolute",
                          left: "0",
                          top: "40px",
                          width: "200px",
                          background: "white",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          boxShadow: "var(--shadow-lg)",
                          zIndex: 100,
                          padding: "5px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "3px"
                        }}>
                          <div style={{ padding: "4px 8px", fontSize: "10px", fontWeight: "bold", color: "var(--text-muted)", borderBottom: "1px solid var(--bg-main)" }}>ترقية الصلاحيات</div>
                          
                          <button onClick={() => handleUpdateRole(doc.id, "specialist")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaStethoscope style={{ color: "var(--accent-emerald)" }} /> ترقية لأخصائي
                          </button>
                          <button onClick={() => handleUpdateRole(doc.id, "consultant")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaStar style={{ color: "var(--accent-purple)" }} /> ترقية لاستشاري
                          </button>
                          <button onClick={() => handleUpdateRole(doc.id, "dept_head")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaCrown style={{ color: "var(--accent-amber)" }} /> ترقية لرئيس قسم
                          </button>
                          <button onClick={() => handleUpdateRole(doc.id, "chief")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaShieldHalved style={{ color: "var(--accent-red)" }} /> رئيس الأطباء
                          </button>
                          <button onClick={() => handleUpdateRole(doc.id, "doctor")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaUserDoctor style={{ color: "var(--secondary)" }} /> تخفيض لطبيب عادي
                          </button>

                          <div style={{ padding: "4px 8px", fontSize: "10px", fontWeight: "bold", color: "var(--text-muted)", borderTop: "1px solid var(--bg-main)", borderBottom: "1px solid var(--bg-main)", marginTop: "4px" }}>الحساب الرقمي</div>
                          
                          <button onClick={() => handleUpdateDigitalStatus(doc.id, "active")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaLockOpen style={{ color: "var(--accent-emerald)" }} /> تفعيل الحساب
                          </button>
                          <button onClick={() => handleUpdateDigitalStatus(doc.id, "pending")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaHourglassHalf style={{ color: "var(--accent-amber)" }} /> تعليق / قيد التفعيل
                          </button>
                          <button onClick={() => handleUpdateDigitalStatus(doc.id, "inactive")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaLock style={{ color: "var(--accent-red)" }} /> إلغاء تفعيل الحساب
                          </button>

                          <div style={{ borderTop: "1px solid var(--bg-main)", paddingTop: "4px", marginTop: "4px" }}>
                            <button onClick={() => handleToggleActive(doc.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaCircleStop style={{ color: "var(--accent-amber)" }} /> 
                              {doc.status === "active" ? "إيقاف مؤقت للعمل" : "إعادة تفعيل للعمل"}
                            </button>
                            <button onClick={() => handleDeleteDoctor(doc.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", color: "var(--accent-red)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaTrashCan style={{ color: "var(--accent-red)" }} /> حذف الطبيب
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    ⚠️ لا يوجد أطباء مطابقين للتصفية المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ width: "550px" }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>
              ➕ إضافة طبيب جديد للسجل
            </h2>
            <form onSubmit={handleAddDoctorSubmit} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label>اسم الطبيب الثنائي <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: أحمد محمد علي" 
                  required
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>القسم الطبي <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newDoctor.department}
                    onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر القسم</option>
                    {initialDepartmentsData.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label>التخصص الدقيق <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="مثال: أمراض السكري، باطنة..." 
                    required
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>رقم الهاتف <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="010XXXXXXXX" 
                    required
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label>فترة المناوبة</label>
                  <select 
                    value={newDoctor.shift}
                    onChange={(e) => setNewDoctor({ ...newDoctor, shift: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="morning">صباحية</option>
                    <option value="evening">مسائية</option>
                    <option value="night">ليلية</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                <div>
                  <label>الدرجة الوظيفية</label>
                  <select 
                    value={newDoctor.role}
                    onChange={(e) => setNewDoctor({ ...newDoctor, role: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="doctor">طبيب</option>
                    <option value="specialist">أخصائي</option>
                    <option value="consultant">استشاري</option>
                    <option value="dept_head">رئيس قسم</option>
                    <option value="chief">رئيس الأطباء</option>
                  </select>
                </div>

                <div>
                  <label>حالة الحساب الرقمي</label>
                  <select 
                    value={newDoctor.digitalAccountStatus}
                    onChange={(e) => setNewDoctor({ ...newDoctor, digitalAccountStatus: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="active">مفعل</option>
                    <option value="pending">قيد التفعيل</option>
                    <option value="inactive">غير مفعل</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn">حفظ الطبيب</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default HospitalDoctors;
