import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import api from "../../utils/api";

import { 
  FaCalendarDay, 
  FaClock, 
  FaSpinner, 
  FaCircleCheck, 
  FaPlus, 
  FaUser, 
  FaUserDoctor, 
  FaLayerGroup, 
  FaFilter,
  FaChevronDown
} from "react-icons/fa6";

function mapFollowUpTypeToArabic(type) {
  switch (type) {
    case "DoctorVisit": return "زيارة طبيب";
    case "NurseCheck": return "فحص ممرض";
    case "MedicationReminder": return "تذكير بالدواء";
    case "LabTest": return "تحليل مخبري";
    case "Radiology": return "أشعة تشخيصية";
    case "SurgeryPreparation": return "عملية جراحية";
    case "PharmacyConsultation": return "استشارة صيدلانية";
    default: return type || "أخرى";
  }
}

function mapStatusToArabic(status) {
  switch (status) {
    case "Pending": return "مجدولة";
    case "Done": return "مكتملة";
    case "Missed": return "فائتة";
    case "Cancelled": return "ملغاة";
    default: return status || "مجدولة";
  }
}

function HospitalOperations({ showToast }) {
  const [operations, setOperations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchPatient, setSearchPatient] = useState("");
  const [searchSurgeon, setSearchSurgeon] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("كل الحالات");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Operation Form State
  const [newOp, setNewOp] = useState({
    patientId: "",
    doctorId: "",
    type: "SurgeryPreparation",
    contactMethod: "Hospital visit",
    date: new Date().toISOString().split("T")[0],
    time: "",
    notes: ""
  });

  const facilityId = sessionStorage.getItem("facilityId") || "f203157f-0975-4bcf-b8c7-48c2fba672bf";

  // Fetch operations
  const fetchOperations = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/api/v1/facilities/${facilityId}/operations`, {
        params: {
          Search: searchPatient || undefined,
          Page: page,
          PageSize: pageSize,
          status: selectedStatus !== "كل الحالات" ? selectedStatus : undefined
        }
      });
      if (response.data && response.data.success) {
        const data = response.data.data;
        const items = data.items || [];
        const mapped = items.map(op => {
          const scheduledAt = op.scheduledAt || "";
          const datePart = scheduledAt.split("T")[0] || "-";
          const timePart = scheduledAt.split("T")[1]?.substring(0, 5) || "-";
          return {
            id: op.patientFollowUpId || op.id || "",
            opNumber: `OP-${(op.patientFollowUpId || op.id || "").substring(0, 5).toUpperCase()}`,
            patientName: op.patientDisplayName || op.patientName || "مريض غير مسمى",
            surgeon: op.doctorDisplayName || op.doctorName || "طبيب غير مسمى",
            department: op.departmentName || "قسم العمليات",
            room: op.followUpContactMethod || "غرفة العمليات",
            date: datePart,
            time: timePart,
            status: op.status || "Pending",
            initialLetter: (op.patientDisplayName || op.patientName || "م").charAt(0)
          };
        });
        setOperations(mapped);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || items.length);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load operations:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Load modal dependencies
  const loadModalData = async () => {
    try {
      const docRes = await api.get("/api/v1/users", { params: { role: "Doctor", Page: 1, PageSize: 100 } });
      setDoctors(docRes.data?.data?.items || []);

      const patRes = await api.get("/api/v1/users", { params: { role: "Patient", Page: 1, PageSize: 100 } });
      setPatients(patRes.data?.data?.items || []);
    } catch (err) {
      console.error("Failed to load operations modal data:", err);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [searchPatient, selectedStatus, page]);

  useEffect(() => {
    if (isModalOpen) {
      loadModalData();
    }
  }, [isModalOpen]);

  // Filter local copy if needed (e.g. search by surgeon)
  const filteredOps = operations.filter(op => {
    const matchesSurgeon = op.surgeon.includes(searchSurgeon);
    return matchesSurgeon;
  });

  // Stats
  const totalToday = totalCount;
  const activeCount = operations.filter(o => o.status === "Pending").length; // Pending / Scheduled
  const completedCount = operations.filter(o => o.status === "Done").length; // Done

  // Complete Operation Handler
  const handleCompleteOperation = async (id) => {
    try {
      await api.patch(`/api/v1/operations/follow-ups/${id}/complete`);
      fetchOperations();
      showToast?.("تم وضع حالة المتابعة/العملية كمكتملة بنجاح.", "success");
    } catch (err) {
      console.error("Failed to complete operation:", err);
      showToast?.("فشل تحديث حالة العملية بالخادم.", "danger");
    }
    setActiveDropdownId(null);
  };

  // Add Operation Submit
  const handleAddOpSubmit = async (e) => {
    e.preventDefault();
    if (!newOp.patientId || !newOp.doctorId || !newOp.time) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    try {
      const scheduledAt = `${newOp.date}T${newOp.time}:00Z`;
      await api.post("/api/v1/operations/follow-ups", {
        patientId: newOp.patientId,
        followUpDoctorId: newOp.doctorId,
        assignedToUserId: newOp.doctorId,
        followUpContactMethod: newOp.contactMethod,
        type: newOp.type,
        scheduledAt,
        notes: newOp.notes
      });
      fetchOperations();
      setIsModalOpen(false);
      showToast?.("تم جدولة العملية بنجاح وحفظها بالخادم!", "success");
      // Reset form
      setNewOp({
        patientId: "",
        doctorId: "",
        type: "SurgeryPreparation",
        contactMethod: "Hospital visit",
        date: new Date().toISOString().split("T")[0],
        time: "",
        notes: ""
      });
    } catch (err) {
      console.error("Failed to create follow-up:", err);
      showToast?.("فشل جدولة العملية بالخادم.", "danger");
    }
  };

  return (
    <div id="hospitalOperationsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>العمليات الجراحية 🏥</h2>
          <p>متابعة وتنسيق جدول العمليات الجراحية اليومي وتوزيع غرف العمليات والأطباء</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* KPI Stats Cards */}
      <div className="cards">
        <div className="card" style={{ borderBottom: "4px solid var(--primary)" }}>
          <h3>إجمالي العمليات</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{totalToday}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "var(--primary-glow)", 
              color: "var(--primary)", 
              padding: "10px", 
              borderRadius: "var(--radius-sm)", 
              display: "inline-flex" 
            }}>
              <FaCalendarDay />
            </span>
          </div>
        </div>

        <div className="card" style={{ borderBottom: "4px solid var(--secondary)" }}>
          <h3>العمليات المجدولة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{activeCount}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "var(--primary-glow)", 
              color: "var(--secondary)", 
              padding: "10px", 
              borderRadius: "var(--radius-sm)", 
              display: "inline-flex" 
            }}>
              <FaClock />
            </span>
          </div>
        </div>

        <div className="card" style={{ borderBottom: "4px solid var(--accent-emerald)" }}>
          <h3>العمليات المكتملة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{completedCount}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(16, 185, 129, 0.08)", 
              color: "var(--accent-emerald)", 
              padding: "10px", 
              borderRadius: "var(--radius-sm)", 
              display: "inline-flex" 
            }}>
              <FaCircleCheck />
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar controls */}
      <div className="box" style={{ padding: "18px", marginBottom: "20px" }}>
        <div className="filters-toolbar" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus style={{ marginLeft: "5px" }} />
            إضافة عملية
          </button>
          
          <div style={{ position: "relative", flex: 1, minWidth: "160px" }}>
            <input 
              type="text" 
              placeholder="بحث باسم المريض..." 
              value={searchPatient}
              onChange={(e) => { setSearchPatient(e.target.value); setPage(1); }}
              style={{ width: "100%", paddingRight: "35px" }}
            />
            <FaUser style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px" }} />
          </div>

          <div style={{ position: "relative", flex: 1, minWidth: "160px" }}>
            <input 
              type="text" 
              placeholder="بحث باسم الجراح..." 
              value={searchSurgeon}
              onChange={(e) => setSearchSurgeon(e.target.value)}
              style={{ width: "100%", paddingRight: "35px" }}
            />
            <FaUserDoctor style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px" }} />
          </div>

          <div style={{ position: "relative", minWidth: "140px" }}>
            <select 
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              style={{ paddingRight: "35px", cursor: "pointer", background: "white" }}
            >
              <option value="كل الحالات">كل الحالات</option>
              <option value="Pending">مجدولة</option>
              <option value="Done">مكتملة</option>
              <option value="Cancelled">ملغاة</option>
            </select>
            <FaFilter style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="box" style={{ overflow: "visible" }}>
        <h2>قائمة الحالات والعمليات الجراحية</h2>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <FaSpinner className="spinner" style={{ fontSize: "28px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", fontWeight: "bold" }}>جاري تحميل جدول العمليات...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", margin: "20px 0" }}>
            <span style={{ fontWeight: "700" }}>فشل تحميل جدول العمليات من الخادم الموحد</span>
            <button className="btn" onClick={fetchOperations} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
          </div>
        ) : filteredOps.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
            <span style={{ color: "#64748b", fontWeight: "600", display: "block" }}>لا توجد عمليات جراحية مجدولة.</span>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table style={{ overflow: "visible" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center", width: "100px" }}>رمز العملية</th>
                    <th style={{ textAlign: "right" }}>اسم المريض</th>
                    <th style={{ textAlign: "right" }}>الجراح</th>
                    <th style={{ textAlign: "right" }}>القسم</th>
                    <th style={{ textAlign: "center" }}>غرفة العمليات / المتابعة</th>
                    <th style={{ textAlign: "center" }}>التاريخ</th>
                    <th style={{ textAlign: "center" }}>الوقت</th>
                    <th style={{ textAlign: "center" }}>الحالة</th>
                    <th style={{ textAlign: "center", width: "110px" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOps.map((op) => (
                    <tr key={op.id}>
                      <td style={{ textAlign: "center", fontFamily: "Outfit", color: "var(--text-muted)" }}>{op.opNumber}</td>
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
                            {op.initialLetter}
                          </div>
                          <span style={{ color: "var(--text-dark)" }}>{op.patientName}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", color: "var(--secondary)", fontWeight: "600" }}>{op.surgeon}</td>
                      <td style={{ textAlign: "right", color: "var(--text-dark)" }}>{op.department}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="status" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                          {op.room}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{op.date}</td>
                      <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{op.time}</td>
                      <td style={{ textAlign: "center" }}>
                        {op.status === "Pending" ? (
                          <span className="status" style={{ background: "var(--primary-light)", color: "var(--secondary)" }}>مجدولة</span>
                        ) : op.status === "Done" ? (
                          <span className="status" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)", fontWeight: "bold" }}>مكتملة</span>
                        ) : (
                          <span className="danger">{mapStatusToArabic(op.status)}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", position: "relative" }}>
                        {op.status === "Pending" && (
                          <>
                            <button 
                              className="btn btn-secondary" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === op.id ? null : op.id);
                              }}
                              style={{ padding: "6px 14px", fontWeight: "bold" }}
                            >
                              إدارة <FaChevronDown style={{ fontSize: "8px", marginRight: "4px" }} />
                            </button>
                            
                            {/* Action Dropdown Menu */}
                            {activeDropdownId === op.id && (
                              <>
                                <div 
                                  style={{ position: "fixed", inset: 0, zIndex: 90 }} 
                                  onClick={() => setActiveDropdownId(null)}
                                ></div>
                                <div style={{
                                  position: "absolute",
                                  left: "0",
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
                                  gap: "3px"
                                }}>
                                  <button onClick={() => handleCompleteOperation(op.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                                    <FaCircleCheck style={{ color: "var(--accent-emerald)" }} /> مكتملة
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                        {op.status !== "Pending" && <span>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
              <div>عرض {operations.length} من {totalCount} عملية</div>
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

      {/* Add Operation Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ width: "550px" }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>
              ➕ جدولة عملية جراحية جديدة
            </h2>
            <form onSubmit={handleAddOpSubmit} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label>اسم المريض <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <select 
                  required
                  value={newOp.patientId}
                  onChange={(e) => setNewOp({ ...newOp, patientId: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="" disabled hidden>اختر المريض</option>
                  {patients.map(p => (
                    <option key={p.userId} value={p.userId}>{p.displayName} ({p.email || p.username})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>الجراح المعالج <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newOp.doctorId}
                    onChange={(e) => setNewOp({ ...newOp, doctorId: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر الطبيب الجراح</option>
                    {doctors.map(d => (
                      <option key={d.userId} value={d.userId}>{d.displayName}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label>نوع المتابعة / الفحص</label>
                  <select 
                    value={newOp.type}
                    onChange={(e) => setNewOp({ ...newOp, type: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="SurgeryPreparation">عملية جراحية</option>
                    <option value="DoctorVisit">زيارة طبيب</option>
                    <option value="NurseCheck">فحص ممرض</option>
                    <option value="LabTest">تحليل مخبري</option>
                    <option value="Radiology">أشعة تشخيصية</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>موقع المتابعة / الغرفة</label>
                  <input 
                    type="text" 
                    placeholder="مثال: غرفة العمليات الكبرى، عيادة 1..." 
                    value={newOp.contactMethod}
                    onChange={(e) => setNewOp({ ...newOp, contactMethod: e.target.value })}
                  />
                </div>
                <div>
                  <label>الوقت <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="time" 
                    required
                    value={newOp.time}
                    onChange={(e) => setNewOp({ ...newOp, time: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>التاريخ <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="date" 
                  required
                  value={newOp.date}
                  onChange={(e) => setNewOp({ ...newOp, date: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label>ملاحظات إضافية</label>
                <textarea 
                  rows="3" 
                  placeholder="توصيات أو تفاصيل إضافية..."
                  value={newOp.notes}
                  onChange={(e) => setNewOp({ ...newOp, notes: e.target.value })}
                  style={{ width: "100%", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn">حفظ الجدولة</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalOperations;
