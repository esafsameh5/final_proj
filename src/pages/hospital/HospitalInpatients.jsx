import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import api from "../../utils/api";

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
  FaDoorOpen,
  FaSpinner
} from "react-icons/fa6";

function HospitalInpatients({ showToast }) {
  const [inpatients, setInpatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("الأقسام");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Form dependency data from backend
  const [dbPatients, setDbPatients] = useState([]);
  const [dbDepts, setDbDepts] = useState([]);
  const [dbBeds, setDbBeds] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
    patientId: "",
    departmentId: "",
    bedId: "",
    notes: ""
  });

  const facilityId = sessionStorage.getItem("facilityId") || "f203157f-0975-4bcf-b8c7-48c2fba672bf";

  // Fetch admissions
  const fetchAdmissions = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/api/v1/facilities/${facilityId}/admissions`, {
        params: {
          Search: searchTerm || undefined,
          Page: page,
          PageSize: pageSize,
          IncludeInactive: false // Active admissions only
        }
      });
      if (response.data && response.data.success) {
        const data = response.data.data;
        const items = data.items || [];
        const mapped = items.map(adm => ({
          id: adm.hospitalAdmissionId || adm.id || "",
          name: adm.patientDisplayName || adm.patientName || "مريض غير مسمى",
          medicalId: adm.patientNationalNumber || adm.patientId || "-",
          department: adm.departmentName || adm.medicalDepartmentName || "الجراحة العامة",
          bedNumber: adm.bedNumber || "غير محدد",
          admissionDate: adm.admittedAt ? adm.admittedAt.split("T")[0] : "-",
          notes: adm.notes || "",
          status: adm.status ? adm.status.toLowerCase() : "active"
        }));
        setInpatients(mapped);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || items.length);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load admissions:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Load modal dependencies
  const loadModalData = async () => {
    try {
      const pRes = await api.get("/api/v1/users", { params: { role: "Patient", Page: 1, PageSize: 100 } });
      setDbPatients(pRes.data?.data?.items || []);

      const dRes = await api.get(`/api/v1/facilities/${facilityId}/departments`, { params: { Page: 1, PageSize: 100 } });
      setDbDepts(dRes.data?.data?.items || []);

      const bRes = await api.get(`/api/v1/facilities/${facilityId}/beds`, { params: { status: "Available", Page: 1, PageSize: 100 } });
      setDbBeds(bRes.data?.data?.items || []);
    } catch (err) {
      console.error("Failed to load admission dependencies:", err);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [searchTerm, page]);

  useEffect(() => {
    if (isModalOpen) {
      loadModalData();
    }
  }, [isModalOpen]);

  // Filter patients by department locally (if dropdown filters are selected)
  const filteredInpatients = inpatients.filter(pat => {
    const matchesDept = selectedDept === "الأقسام" || pat.department === selectedDept;
    return matchesDept;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
      case "stable":
        return <span className="status">نشط</span>;
      case "discharged":
        return <span className="status" style={{ background: "var(--primary-light)", color: "var(--secondary)" }}>تم الخروج</span>;
      default:
        return <span className="status">نشط</span>;
    }
  };

  // Discharge Handler
  const handleDischarge = (id) => {
    const patient = inpatients.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد تسجيل خروج المريض",
      message: `هل أنت متأكد من تسجيل خروج المريض (${patient?.name || ''}) وإخلاء السرير الخاص به؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: "تسجيل خروج وإخلاء",
      type: "warning",
      onConfirm: async () => {
        try {
          await api.patch(`/api/v1/operations/admissions/${id}/discharge`);
          fetchAdmissions();
          showToast?.(`تم تسجيل خروج المريض ${patient?.name || ''} بنجاح.`, "success");
        } catch (err) {
          console.error("Failed to discharge patient:", err);
          showToast?.("فشل تسجيل خروج المريض من الخادم.", "danger");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  // Add new inpatient submit
  const handleAddInpatientSubmit = async (e) => {
    e.preventDefault();
    if (!newInpatient.patientId || !newInpatient.departmentId || !newInpatient.bedId) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    try {
      await api.post("/api/v1/operations/admissions", {
        patientId: newInpatient.patientId,
        healthFacilityId: facilityId,
        medicalDepartmentId: newInpatient.departmentId,
        bedId: newInpatient.bedId,
        admittedAt: new Date().toISOString(),
        notes: newInpatient.notes
      });
      fetchAdmissions();
      setIsModalOpen(false);
      showToast?.("تم تسجيل دخول المريض بنجاح وحفظه بالخادم!", "success");
      setNewInpatient({
        patientId: "",
        departmentId: "",
        bedId: "",
        notes: ""
      });
    } catch (err) {
      console.error("Failed to register admission:", err);
      showToast?.("فشل تسجيل المريض بالخادم.", "danger");
    }
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
              {dbDepts.map(d => (
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

      {/* Stats Cards */}
      <div className="cards">
        <div className="card">
          <h3>المرضى الحاليين</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{totalCount} نزيل</p>
            <span style={{ 
              fontSize: "24px", 
              background: "var(--primary-glow)", 
              color: "var(--primary)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaUserGroup />
            </span>
          </div>
        </div>
      </div>

      {/* Inpatients Table */}
      <div className="box" style={{ overflow: "visible" }}>
        <h2>قائمة المرضى المقيمين بالأقسام</h2>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <FaSpinner className="spinner" style={{ fontSize: "28px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", fontWeight: "bold" }}>جاري تحميل المرضى المقيمين...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", margin: "20px 0" }}>
            <span style={{ fontWeight: "700" }}>فشل تحميل سجل المرضى من الخادم الموحد</span>
            <button className="btn" onClick={fetchAdmissions} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
          </div>
        ) : filteredInpatients.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
            <span style={{ color: "#64748b", fontWeight: "600", display: "block" }}>لا يوجد مرضى مقيمين حالياً.</span>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table style={{ overflow: "visible" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center", width: "60px" }}>#</th>
                    <th style={{ textAlign: "right" }}>اسم المريض</th>
                    <th style={{ textAlign: "center" }}>الرقم الطبي / المعرف</th>
                    <th style={{ textAlign: "right" }}>القسم</th>
                    <th style={{ textAlign: "center" }}>رمز السرير</th>
                    <th style={{ textAlign: "center" }}>تاريخ الدخول</th>
                    <th style={{ textAlign: "right" }}>ملاحظات التنويم</th>
                    <th style={{ textAlign: "center" }}>الحالة</th>
                    <th style={{ textAlign: "center", width: "110px" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInpatients.map((pat, idx) => (
                    <tr key={pat.id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{(page - 1) * pageSize + idx + 1}</td>
                      <td style={{ textAlign: "right", fontWeight: "700", color: "var(--text-dark)" }}>{pat.name}</td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit", color: "var(--text-muted)" }}>{pat.medicalId}</td>
                      <td style={{ textAlign: "right", fontWeight: "600", color: "var(--primary)" }}>{pat.department}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="status" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: "11.5px" }}>
                          {pat.bedNumber}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{pat.admissionDate}</td>
                      <td style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "12px" }}>{pat.notes || "-"}</td>
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
                              <button onClick={() => handleDischarge(pat.id)} style={{ width: "100%", textAlign: "right", padding: "8px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", color: "var(--accent-emerald)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold" }} className="btn-secondary">
                                <FaDoorOpen style={{ color: "var(--accent-emerald)" }} /> تسجيل خروج المريض
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

            {/* Pagination Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
              <div>عرض {inpatients.length} من {totalCount} نزيل</div>
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

      {/* Add Inpatient Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ width: "550px" }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>
              ➕ تسجيل دخول مريض جديد للأقسام
            </h2>
            <form onSubmit={handleAddInpatientSubmit} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label>اسم المريض <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <select 
                  required
                  value={newInpatient.patientId}
                  onChange={(e) => setNewInpatient({ ...newInpatient, patientId: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="" disabled hidden>اختر المريض</option>
                  {dbPatients.map(p => (
                    <option key={p.userId} value={p.userId}>{p.displayName} ({p.email || p.username})</option>
                  ))}
                  {dbPatients.length === 0 && <option value="" disabled>لا يوجد مرضى مسجلين بالنظام</option>}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>القسم الموجه إليه <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newInpatient.departmentId}
                    onChange={(e) => setNewInpatient({ ...newInpatient, departmentId: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر القسم</option>
                    {dbDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>السرير المتاح <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newInpatient.bedId}
                    onChange={(e) => setNewInpatient({ ...newInpatient, bedId: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر السرير</option>
                    {dbBeds.map(b => (
                      <option key={b.bedId || b.id} value={b.bedId || b.id}>{b.bedNumber || b.code || "سرير"}</option>
                    ))}
                    {dbBeds.length === 0 && <option value="" disabled>لا توجد أسرة شاغرة حالياً</option>}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label>ملاحظات الدخول</label>
                <textarea 
                  rows="3" 
                  placeholder="ملاحظات تشخيصية أولية أو تعليمات..."
                  value={newInpatient.notes}
                  onChange={(e) => setNewInpatient({ ...newInpatient, notes: e.target.value })}
                  style={{ width: "100%", fontFamily: "inherit" }}
                />
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
