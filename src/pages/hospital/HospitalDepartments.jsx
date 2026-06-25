import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

import { 
  FaHospital, 
  FaCheck, 
  FaXmark, 
  FaBed, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaEllipsisVertical,
  FaRegBell,
  FaTrashCan,
  FaPen
} from "react-icons/fa6";
import { initialDepartmentsData } from "../../data/hospital/departments";
import ConfirmModal from "../../components/common/ConfirmModal";

function HospitalDepartments({ showToast }) {
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem("hospital_departments");
    return saved ? JSON.parse(saved) : initialDepartmentsData;
  });

  useEffect(() => {
    localStorage.setItem("hospital_departments", JSON.stringify(departments));
  }, [departments]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  });
  
  // New Department Form State
  const [newDept, setNewDept] = useState({
    name: "",
    specialty: "",
    doctorsCount: 0,
    bedsCount: 0,
    status: "active"
  });

  // Filter departments by search
  const filteredDepts = departments.filter(dept => 
    dept.name.includes(searchTerm) || 
    dept.specialty.includes(searchTerm)
  );

  // Stats
  const totalDepts = departments.length;
  const activeDepts = departments.filter(d => d.status === "active").length;
  const inactiveDepts = totalDepts - activeDepts;
  const totalBeds = departments.reduce((acc, d) => acc + Number(d.bedsCount), 0);

  // Toggle status
  const handleToggleStatus = (id) => {
    let updatedDeptName = "";
    let isNowActive = false;
    setDepartments(prev => prev.map(d => {
      if (d.id === id) {
        const newStatus = d.status === "active" ? "inactive" : "active";
        updatedDeptName = d.name;
        isNowActive = newStatus === "active";
        return { ...d, status: newStatus };
      }
      return d;
    }));
    setActiveDropdownId(null);
    showToast?.(`تم تحديث حالة قسم ${updatedDeptName} إلى: ${isNowActive ? "نشط 🟢" : "غير نشط 🔴"}`, "success");
  };

  // Delete department
  const handleDeleteDept = (id) => {
    const deptToDelete = departments.find(d => d.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف القسم",
      message: `هل أنت متأكد من حذف قسم (${deptToDelete?.name || ''}) نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setDepartments(prev => prev.filter(d => d.id !== id));
        showToast?.(`تم حذف قسم ${deptToDelete?.name || ''} بنجاح.`, "success");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  // Submit new department form
  const handleSubmitNewDept = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.specialty) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }
    
    const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    const departmentToAdd = {
      id: newId,
      name: newDept.name,
      specialty: newDept.specialty,
      doctorsCount: Number(newDept.doctorsCount) || 0,
      bedsCount: Number(newDept.bedsCount) || 0,
      status: newDept.status
    };

    setDepartments(prev => [...prev, departmentToAdd]);
    setIsModalOpen(false);
    showToast?.(`تم إضافة قسم ${departmentToAdd.name} بنجاح.`, "success");
    // Reset form
    setNewDept({
      name: "",
      specialty: "",
      doctorsCount: 0,
      bedsCount: 0,
      status: "active"
    });
  };

  return (
    <div id="hospitalDepartmentsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>الأقسام الطبية 🏥</h2>
          <p>عرض وتحديث بيانات الأقسام الطبية وتوزيع الأسرة والأطقم الطبية</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Quick controls (Add & Search) */}
      <div className="filters-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <FaPlus style={{ marginLeft: "5px" }} />
          إضافة قسم جديد
        </button>
        
        <div className="topbar-search-group" style={{ margin: 0, width: "320px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input 
              type="text" 
              placeholder="البحث عن قسم..." 
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

      {/* Metrics Cards */}
      <div className="cards">
        <div className="card">
          <h3>إجمالي الأقسام</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{totalDepts}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "var(--primary-glow)", 
              color: "var(--primary)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaHospital />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>الأقسام النشطة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{activeDepts}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(16, 185, 129, 0.08)", 
              color: "var(--accent-emerald)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaCheck />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>الأقسام غير النشطة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{inactiveDepts}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(239, 68, 68, 0.08)", 
              color: "var(--accent-red)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaXmark />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>إجمالي الأسرة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{totalBeds}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(139, 92, 246, 0.08)", 
              color: "var(--accent-purple)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaBed />
            </span>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="box">
        <h2>قائمة الأقسام</h2>
        <div className="table-container">
          <table style={{ overflow: "visible" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "80px" }}>#</th>
                <th style={{ textAlign: "right" }}>اسم القسم</th>
                <th style={{ textAlign: "right" }}>التخصص</th>
                <th style={{ textAlign: "center" }}>عدد الأطباء</th>
                <th style={{ textAlign: "center" }}>عدد الأسرة</th>
                <th style={{ textAlign: "center" }}>الحالة</th>
                <th style={{ textAlign: "center", width: "100px" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((dept, index) => (
                <tr key={dept.id}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{index + 1}</td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "var(--primary)" }}>{dept.name}</td>
                  <td style={{ textAlign: "right", color: "var(--text-dark)" }}>{dept.specialty}</td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit", fontWeight: "600" }}>{dept.doctorsCount}</td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit", fontWeight: "600" }}>{dept.bedsCount}</td>
                  <td style={{ textAlign: "center" }}>
                    {dept.status === "active" ? (
                      <span className="status">نشط</span>
                    ) : (
                      <span className="danger">غير نشط</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", position: "relative" }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === dept.id ? null : dept.id);
                      }}
                      style={{ padding: "6px 12px", minWidth: "auto" }}
                    >
                      <FaEllipsisVertical />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    {activeDropdownId === dept.id && (
                      <>
                        <div 
                          style={{ position: "fixed", inset: 0, zIndex: 90 }} 
                          onClick={() => setActiveDropdownId(null)}
                        ></div>
                        <div style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          top: "40px",
                          width: "160px",
                          background: "white",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          boxShadow: "var(--shadow-lg)",
                          zIndex: 100,
                          padding: "5px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}>
                          <button 
                            onClick={() => handleToggleStatus(dept.id)}
                            style={{ 
                              width: "100%", 
                              textAlign: "right", 
                              padding: "8px 12px", 
                              fontSize: "12.5px", 
                              border: "none", 
                              background: "none", 
                              cursor: "pointer", 
                              borderRadius: "var(--radius-sm)",
                              transition: "var(--transition)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                            className="btn-secondary"
                          >
                            <FaCheck style={{ color: "var(--accent-emerald)" }} />
                            <span>تغيير الحالة</span>
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteDept(dept.id)}
                            style={{ 
                              width: "100%", 
                              textAlign: "right", 
                              padding: "8px 12px", 
                              fontSize: "12.5px", 
                              border: "none", 
                              background: "none", 
                              cursor: "pointer", 
                              color: "var(--accent-red)",
                              borderRadius: "var(--radius-sm)",
                              transition: "var(--transition)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                            className="btn-secondary"
                          >
                            <FaTrashCan style={{ color: "var(--accent-red)" }} />
                            <span>حذف القسم</span>
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDepts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    ⚠️ لا توجد أقسام مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
          <div>عرض {filteredDepts.length} من {totalDepts} قسم</div>
          <div style={{ display: "flex", gap: "5px" }}>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} disabled>السابق</button>
            <button className="btn" style={{ padding: "6px 12px", fontSize: "12px", minWidth: "30px" }}>1</button>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} disabled>التالي</button>
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ width: "500px" }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>
              ➕ إضافة قسم طبي جديد
            </h2>
            <form onSubmit={handleSubmitNewDept} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label>اسم القسم <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: الباطنة، العظام..." 
                  required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>تخصص القسم <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: أمراض باطنة، جراحة عامة..." 
                  required
                  value={newDept.specialty}
                  onChange={(e) => setNewDept({ ...newDept, specialty: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>عدد الأطباء الأولي</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    value={newDept.doctorsCount}
                    onChange={(e) => setNewDept({ ...newDept, doctorsCount: e.target.value })}
                  />
                </div>
                <div>
                  <label>عدد الأسرة الأولي</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    value={newDept.bedsCount}
                    onChange={(e) => setNewDept({ ...newDept, bedsCount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label>الحالة التشغيلية</label>
                <select 
                  value={newDept.status}
                  onChange={(e) => setNewDept({ ...newDept, status: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn">حفظ القسم</button>
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

export default HospitalDepartments;
