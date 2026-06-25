import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

import { 
  FaBed, 
  FaClock, 
  FaStar, 
  FaHeartPulse, 
  FaUserGroup, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaFilter, 
  FaChevronDown, 
  FaRegBell,
  FaCalendarDays,
  FaIdCardClip,
  FaFileMedical,
  FaVial,
  FaXRay,
  FaRightLeft,
  FaHouseLaptop,
  FaFilePdf,
  FaCalendarCheck,
  FaDoorOpen
} from "react-icons/fa6";
import { initialInpatientsData } from "../../data/hospital/inpatients";
import { initialDepartmentsData } from "../../data/hospital/departments";
import { initialDoctorsData } from "../../data/hospital/doctors";
import ConfirmModal from "../../components/common/ConfirmModal";

function HospitalInpatients({ showToast }) {
  const [inpatients, setInpatients] = useState(() => {
    const saved = localStorage.getItem("hospital_inpatients");
    return saved ? JSON.parse(saved) : initialInpatientsData;
  });

  useEffect(() => {
    localStorage.setItem("hospital_inpatients", JSON.stringify(inpatients));
  }, [inpatients]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("الأقسام");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "تأكيد",
    type: "danger",
    onConfirm: null
  });

  // New Admission Form State
  const [newInpatient, setNewInpatient] = useState({
    name: "",
    medicalId: "",
    department: "",
    doctor: "",
    roomType: "normal",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "stable"
  });

  // Filter patients
  const filteredInpatients = inpatients.filter(pat => {
    const matchesSearch = pat.name.includes(searchTerm) || pat.medicalId.includes(searchTerm);
    const matchesDept = selectedDept === "الأقسام" || pat.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Room type Arabic label
  const getRoomTypeArabic = (type) => {
    switch (type) {
      case "normal": return "غرفة عادية";
      case "private": return "غرفة خاصة";
      case "icu": return "العناية المركزة";
      default: return "غرفة عادية";
    }
  };

  // Status Arabic label
  const getStatusBadge = (status) => {
    switch (status) {
      case "stable":
        return <span className="status">مستقر</span>;
      case "observation":
        return <span className="status" style={{ background: "var(--primary-light)", color: "var(--secondary)" }}>تحت الملاحظة</span>;
      case "critical":
        return <span className="danger">حرج</span>;
      default:
        return <span className="status">مستقر</span>;
    }
  };

  // Row Action Handlers
  const handleStatusChange = (id, newStatus) => {
    let patientName = "";
    setInpatients(prev => prev.map(p => {
      if (p.id === id) {
        patientName = p.name;
        return { ...p, status: newStatus };
      }
      return p;
    }));
    setActiveDropdownId(null);
    const statusAr = newStatus === 'stable' ? 'مستقر' : newStatus === 'observation' ? 'تحت الملاحظة' : 'حرج';
    showToast?.(`تم تحديث الحالة الطبية للمريض ${patientName} بنجاح إلى: ${statusAr}.`, "success");
  };

  const handleDischarge = (id) => {
    const patient = inpatients.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد تسجيل خروج المريض",
      message: `هل أنت متأكد من تسجيل خروج المريض (${patient?.name || ''}) وإخلاء السرير الخاص به؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "تسجيل خروج وإخلاء",
      type: "warning",
      onConfirm: () => {
        setInpatients(prev => prev.filter(p => p.id !== id));
        showToast?.(`تم تسجيل خروج المريض ${patient?.name || ''} بنجاح.`, "success");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  const handleActionToast = (actionName) => {
    showToast?.(`سيتم إرسال طلب (${actionName}) للأنظمة الفرعية التابعة للمستشفى قريباً.`, "info");
    setActiveDropdownId(null);
  };

  // Add new inpatient submit
  const handleAddInpatientSubmit = (e) => {
    e.preventDefault();
    if (!newInpatient.name || !newInpatient.medicalId || !newInpatient.department || !newInpatient.doctor) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    const newId = inpatients.length > 0 ? Math.max(...inpatients.map(p => p.id)) + 1 : 1;
    const patientToAdd = {
      id: newId,
      name: newInpatient.name,
      medicalId: newInpatient.medicalId.startsWith("P") ? newInpatient.medicalId : "P" + newInpatient.medicalId,
      department: newInpatient.department,
      doctor: newInpatient.doctor,
      roomType: newInpatient.roomType,
      admissionDate: newInpatient.admissionDate,
      duration: "اليوم الأول",
      status: newInpatient.status
    };

    setInpatients(prev => [...prev, patientToAdd]);
    setIsModalOpen(false);
    showToast?.(`تم تسجيل المريض ${patientToAdd.name} كنزيل بنجاح.`, "success");
    // Reset Form
    setNewInpatient({
      name: "",
      medicalId: "",
      department: "",
      doctor: "",
      roomType: "normal",
      admissionDate: new Date().toISOString().split("T")[0],
      status: "stable"
    });
  };

  return (
    <div id="hospitalInpatientsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>المرضى المقيمين 🛌</h2>
          <p>متابعة المرضى المقيمين بالأقسام، وإدارة الأسرة والتحويلات الداخلية</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Tools section */}
      <div className="filters-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", smWidth: "auto", flex: 1 }}>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus style={{ marginLeft: "5px" }} />
            إضافة دخول جديد
          </button>
          
          <div style={{ position: "relative", minWidth: "150px" }}>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ paddingRight: "35px", cursor: "pointer", background: "white" }}
            >
              <option value="الأقسام">الأقسام</option>
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
              placeholder="بحث عن مريض..." 
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

      {/* Stats Cards */}
      <div className="cards">
        <div className="card">
          <h3>متوسط الإقامة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>4.2 يوم</p>
            <span style={{ 
              fontSize: "24px", 
              background: "var(--primary-glow)", 
              color: "var(--primary)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaClock />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>الغرف الخاصة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>8 مرضى</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(245, 158, 11, 0.08)", 
              color: "var(--accent-amber)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaStar />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>الغرف العادية</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>64 مريض</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(16, 185, 129, 0.08)", 
              color: "var(--accent-emerald)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaBed />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>العناية المركزة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>12 مريض</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(139, 92, 246, 0.08)", 
              color: "var(--accent-purple)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaHeartPulse />
            </span>
          </div>
        </div>
      </div>

      {/* Inpatients Table */}
      <div className="box" style={{ overflow: "visible" }}>
        <h2>قائمة المرضى المقيمين بالأقسام</h2>
        <div className="table-container">
          <table style={{ overflow: "visible" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "60px" }}>#</th>
                <th style={{ textAlign: "right" }}>اسم المريض</th>
                <th style={{ textAlign: "center" }}>الرقم الطبي</th>
                <th style={{ textAlign: "right" }}>القسم</th>
                <th style={{ textAlign: "right" }}>الطبيب المعالج</th>
                <th style={{ textAlign: "center" }}>نوع الغرفة</th>
                <th style={{ textAlign: "center" }}>تاريخ الدخول</th>
                <th style={{ textAlign: "center" }}>مدة الإقامة</th>
                <th style={{ textAlign: "center" }}>الحالة</th>
                <th style={{ textAlign: "center", width: "110px" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInpatients.map((pat, idx) => (
                <tr key={pat.id}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "var(--text-dark)" }}>{pat.name}</td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit", color: "var(--text-muted)" }}>{pat.medicalId}</td>
                  <td style={{ textAlign: "right", fontWeight: "600", color: "var(--primary)" }}>{pat.department}</td>
                  <td style={{ textAlign: "right", color: "var(--text-dark)" }}>{pat.doctor}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="status" style={{ 
                      background: pat.roomType === "icu" ? "var(--accent-red-light)" : pat.roomType === "private" ? "var(--accent-amber-light)" : "var(--primary-light)",
                      color: pat.roomType === "icu" ? "#991b1b" : pat.roomType === "private" ? "#92400e" : "var(--primary)",
                      fontSize: "11.5px"
                    }}>
                      {getRoomTypeArabic(pat.roomType)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{pat.admissionDate}</td>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{pat.duration}</td>
                  <td style={{ textAlign: "center" }}>{getStatusBadge(pat.status)}</td>
                  <td style={{ textAlign: "center", position: "relative" }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === pat.id ? null : pat.id);
                      }}
                      style={{ padding: "6px 14px", fontWeight: "bold" }}
                    >
                      إجراءات <FaChevronDown style={{ fontSize: "8px", marginRight: "4px" }} />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    {activeDropdownId === pat.id && (
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
                          <button onClick={() => handleActionToast("عرض الملف الطبي")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaIdCardClip style={{ color: "var(--secondary)" }} /> عرض الملف الطبي
                          </button>
                          
                          <button onClick={() => handleStatusChange(pat.id, pat.status === "stable" ? "critical" : "stable")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaHeartPulse style={{ color: "var(--accent-amber)" }} /> تغيير الحالة الطبية
                          </button>
                          
                          <button onClick={() => handleActionToast("إضافة وصفة")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaFileMedical style={{ color: "var(--accent-emerald)" }} /> إضافة وصفة علاج
                          </button>

                          <button onClick={() => handleActionToast("طلب تحليل")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaVial style={{ color: "var(--accent-purple)" }} /> طلب تحليل مخبري
                          </button>

                          <button onClick={() => handleActionToast("طلب أشعة")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaXRay style={{ color: "var(--secondary)" }} /> طلب أشعة تشخيصية
                          </button>

                          <button onClick={() => handleActionToast("نقل غرفة")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaRightLeft style={{ color: "rgba(245, 158, 11, 0.8)" }} /> نقل لغرفة أخرى
                          </button>

                          <button onClick={() => handleActionToast("تحويل قسم")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaHouseLaptop style={{ color: "var(--primary)" }} /> تحويل لقسم آخر
                          </button>

                          <button onClick={() => handleActionToast("إضافة تقرير")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaFilePdf style={{ color: "var(--text-muted)" }} /> إضافة تقرير طبي
                          </button>

                          <button onClick={() => handleActionToast("جدولة عملية")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaCalendarCheck style={{ color: "var(--accent-purple)" }} /> جدولة عملية جراحية
                          </button>

                          <div style={{ borderTop: "1px solid var(--bg-main)", paddingTop: "4px", marginTop: "4px" }}>
                            <button onClick={() => handleDischarge(pat.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", color: "var(--accent-emerald)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold" }} className="btn-secondary">
                              <FaDoorOpen style={{ color: "var(--accent-emerald)" }} /> تسجيل خروج المريض
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInpatients.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    ⚠️ لا يوجد مرضى مقيمين مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inpatient Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ width: "550px" }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>
              ➕ إضافة دخول مريض جديد للأقسام
            </h2>
            <form onSubmit={handleAddInpatientSubmit} style={{ marginTop: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>اسم المريض الكامل <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="مثال: أحمد محمد علي" 
                    required
                    value={newInpatient.name}
                    onChange={(e) => setNewInpatient({ ...newInpatient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label>الرقم الطبي للملف <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="مثال: P1001258" 
                    required
                    value={newInpatient.medicalId}
                    onChange={(e) => setNewInpatient({ ...newInpatient, medicalId: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>القسم الموجه إليه <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newInpatient.department}
                    onChange={(e) => setNewInpatient({ ...newInpatient, department: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر القسم</option>
                    {initialDepartmentsData.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>الطبيب المعالج <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newInpatient.doctor}
                    onChange={(e) => setNewInpatient({ ...newInpatient, doctor: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر الطبيب</option>
                    {initialDoctorsData.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>نوع الغرفة / السرير</label>
                  <select 
                    value={newInpatient.roomType}
                    onChange={(e) => setNewInpatient({ ...newInpatient, roomType: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="normal">غرفة عادية</option>
                    <option value="private">غرفة خاصة</option>
                    <option value="icu">العناية المركزة</option>
                  </select>
                </div>

                <div>
                  <label>تاريخ الدخول</label>
                  <input 
                    type="date"
                    required
                    value={newInpatient.admissionDate}
                    onChange={(e) => setNewInpatient({ ...newInpatient, admissionDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label>الحالة التشخيصية الأولية</label>
                <select 
                  value={newInpatient.status}
                  onChange={(e) => setNewInpatient({ ...newInpatient, status: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="stable">مستقر</option>
                  <option value="observation">تحت الملاحظة</option>
                  <option value="critical">حالة حرجة</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn">حفظ الدخول</button>
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
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default HospitalInpatients;
