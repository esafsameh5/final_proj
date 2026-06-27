import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";
import api from "../../utils/api";

import { 
  FaHospital, 
  FaCheck, 
  FaXmark, 
  FaBed, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaEllipsisVertical,
  FaTrashCan,
  FaPen,
  FaSpinner
} from "react-icons/fa6";
import ConfirmModal from "../../components/common/ConfirmModal";

// Specialty Mapper helpers
function mapSpecialtyToEnum(input) {
  if (!input) return "General";
  const s = input.toLowerCase();
  if (s.includes("قلب") || s.includes("cardio")) return "Cardiology";
  if (s.includes("باطن") || s.includes("internal")) return "InternalMedicine";
  if (s.includes("أطفال") || s.includes("pediat")) return "Pediatrics";
  if (s.includes("جراح") || s.includes("surger")) return "Surgery";
  if (s.includes("عظام") || s.includes("ortho")) return "Orthopedics";
  if (s.includes("أعصاب") || s.includes("neuro")) return "Neurology";
  if (s.includes("طوارئ") || s.includes("emerg")) return "Emergency";
  if (s.includes("عناية") || s.includes("icu")) return "ICU";
  if (s.includes("أشعة") || s.includes("radio")) return "Radiology";
  if (s.includes("معمل") || s.includes("تحليل") || s.includes("lab")) return "LaboratoryMedicine";
  if (s.includes("صيدل") || s.includes("pharma")) return "Pharmacy";
  return "General";
}

function mapEnumToArabic(enumVal) {
  switch (enumVal) {
    case "General": return "عام";
    case "InternalMedicine": return "الباطنة";
    case "Cardiology": return "أمراض القلب";
    case "Oncology": return "الأورام";
    case "Neurology": return "المخ والأعصاب";
    case "Neurosurgery": return "جراحة المخ والأعصاب";
    case "Pediatrics": return "الأطفال";
    case "Orthopedics": return "العظام";
    case "Surgery": return "الجراحة العامة";
    case "Gynecology": return "النساء والتوليد";
    case "Emergency": return "الطوارئ";
    case "ICU": return "العناية المركزة";
    case "Radiology": return "الأشعة";
    case "LaboratoryMedicine": return "المختبر والمعامل";
    case "Pharmacy": return "الصيدلية";
    default: return enumVal || "أخرى";
  }
}

function HospitalDepartments({ showToast }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
    status: "active"
  });

  const facilityId = sessionStorage.getItem("facilityId") || "f203157f-0975-4bcf-b8c7-48c2fba672bf";

  const fetchDepartments = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/api/v1/facilities/${facilityId}/departments`, {
        params: {
          Search: searchTerm || undefined,
          Page: page,
          PageSize: pageSize,
          IncludeInactive: true
        }
      });
      if (response.data && response.data.success) {
        const data = response.data.data;
        const items = data.items || [];
        const mapped = items.map(d => ({
          id: d.medicalDepartmentId || d.id || "",
          name: d.name || "",
          specialty: mapEnumToArabic(d.specialty),
          rawSpecialty: d.specialty || "General",
          doctorsCount: d.doctorsCount ?? d.doctorCount ?? 0,
          bedsCount: d.bedsCount ?? d.bedCount ?? 0,
          status: d.isActive ? "active" : "inactive"
        }));
        setDepartments(mapped);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || items.length);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [searchTerm, page]);

  // Stats
  const activeDepts = departments.filter(d => d.status === "active").length;
  const inactiveDepts = departments.filter(d => d.status === "inactive").length;
  const totalBeds = departments.reduce((acc, d) => acc + Number(d.bedsCount), 0);

  // Toggle status (PUT update)
  const handleToggleStatus = async (id) => {
    const dept = departments.find(d => d.id === id);
    if (!dept) return;
    const targetActive = dept.status !== "active";
    try {
      await api.put(`/api/v1/facilities/departments/${id}`, {
        name: dept.name,
        specialty: dept.rawSpecialty,
        isActive: targetActive
      });
      fetchDepartments();
      showToast?.(`تم تحديث حالة قسم ${dept.name} بنجاح.`, "success");
    } catch (err) {
      console.error("Failed to update department status:", err);
      showToast?.(`فشل تحديث حالة القسم.`, "danger");
    }
    setActiveDropdownId(null);
  };

  // Delete department (DELETE soft delete)
  const handleDeleteDept = (id) => {
    const deptToDelete = departments.find(d => d.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف القسم",
      message: `هل أنت متأكد من حذف قسم (${deptToDelete?.name || ''}) نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/v1/facilities/departments/${id}`);
          fetchDepartments();
          showToast?.(`تم حذف قسم ${deptToDelete?.name || ''} بنجاح.`, "success");
        } catch (err) {
          console.error("Failed to delete department:", err);
          showToast?.("فشل حذف القسم.", "danger");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  // Submit new department form (POST)
  const handleSubmitNewDept = async (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.specialty) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }
    
    try {
      const mappedSpec = mapSpecialtyToEnum(newDept.specialty);
      await api.post(`/api/v1/facilities/${facilityId}/departments`, {
        name: newDept.name,
        specialty: mappedSpec
      });
      fetchDepartments();
      setIsModalOpen(false);
      showToast?.(`تم إضافة قسم ${newDept.name} بنجاح.`, "success");
      // Reset form
      setNewDept({
        name: "",
        specialty: "",
        status: "active"
      });
    } catch (err) {
      console.error("Failed to create department:", err);
      showToast?.("فشل إضافة القسم.", "danger");
    }
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
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
            <p>{totalCount}</p>
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
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <FaSpinner className="spinner" style={{ fontSize: "28px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", fontWeight: "bold" }}>جاري تحميل الأقسام...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", margin: "20px 0" }}>
            <span style={{ fontWeight: "700" }}>فشل تحميل الأقسام من الخادم الموحد</span>
            <button className="btn" onClick={fetchDepartments} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
          </div>
        ) : departments.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
            <span style={{ color: "#64748b", fontWeight: "600", display: "block" }}>لا توجد أقسام مسجلة.</span>
          </div>
        ) : (
          <>
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
                  {departments.map((dept, index) => (
                    <tr key={dept.id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{(page - 1) * pageSize + index + 1}</td>
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
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
              <div>عرض {departments.length} من {totalCount} قسم</div>
              <div style={{ display: "flex", gap: "5px" }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 12px", fontSize: "12px" }} 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  السابق
                </button>
                <button className="btn" style={{ padding: "6px 12px", fontSize: "12px", minWidth: "30px" }}>{page}</button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 12px", fontSize: "12px" }} 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  التالي
                </button>
              </div>
            </div>
          </>
        )}
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

              <div style={{ marginBottom: "25px" }}>
                <label>تخصص القسم <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: أمراض باطنة، جراحة عامة..." 
                  required
                  value={newDept.specialty}
                  onChange={(e) => setNewDept({ ...newDept, specialty: e.target.value })}
                />
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
