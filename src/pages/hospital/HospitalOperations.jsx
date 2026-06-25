import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

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
  FaRegBell,
  FaDoorClosed,
  FaCalendar,
  FaFloppyDisk,
  FaChevronDown,
  FaTrashCan,
  FaCircleXmark
} from "react-icons/fa6";
import { initialOperationsData } from "../../data/hospital/operations";
import { initialDepartmentsData } from "../../data/hospital/departments";
import { initialDoctorsData } from "../../data/hospital/doctors";
import ConfirmModal from "../../components/common/ConfirmModal";

function HospitalOperations({ showToast }) {
  const [operations, setOperations] = useState(() => {
    const saved = localStorage.getItem("hospital_operations");
    return saved ? JSON.parse(saved) : initialOperationsData;
  });

  useEffect(() => {
    localStorage.setItem("hospital_operations", JSON.stringify(operations));
  }, [operations]);
  const [searchPatient, setSearchPatient] = useState("");
  const [searchSurgeon, setSearchSurgeon] = useState("");
  const [selectedDept, setSelectedDept] = useState("كل الأقسام");
  const [selectedStatus, setSelectedStatus] = useState("كل الحالات");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  });

  // New Operation Form State
  const [newOp, setNewOp] = useState({
    patientName: "",
    surgeon: "",
    department: "",
    type: "",
    room: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    notes: ""
  });

  // Filter Operations
  const filteredOps = operations.filter(op => {
    const matchesPatient = op.patientName.includes(searchPatient);
    const matchesSurgeon = op.surgeon.includes(searchSurgeon);
    const matchesDept = selectedDept === "كل الأقسام" || op.department === selectedDept;
    
    let matchesStatus = true;
    if (selectedStatus !== "كل الحالات") {
      if (selectedStatus === "مجدولة") matchesStatus = op.status === "scheduled";
      else if (selectedStatus === "جارية الآن") matchesStatus = op.status === "active";
      else if (selectedStatus === "مكتملة") matchesStatus = op.status === "completed";
      else if (selectedStatus === "ملغاة") matchesStatus = op.status === "cancelled";
    }

    return matchesPatient && matchesSurgeon && matchesDept && matchesStatus;
  });

  // Stats
  const totalToday = operations.length;
  const activeCount = operations.filter(o => o.status === "active").length;
  const scheduledCount = operations.filter(o => o.status === "scheduled").length;
  const completedCount = operations.filter(o => o.status === "completed").length;

  // Row Action Handlers
  const handleUpdateStatus = (id, newStatus) => {
    let patientName = "";
    setOperations(prev => prev.map(o => {
      if (o.id === id) {
        patientName = o.patientName;
        return { ...o, status: newStatus };
      }
      return o;
    }));
    setActiveDropdownId(null);
    const statusAr = newStatus === 'scheduled' ? 'مجدولة' : newStatus === 'ongoing' ? 'جارية الآن' : 'مكتملة';
    showToast?.(`تم تحديث حالة العملية للمريض ${patientName} بنجاح إلى: ${statusAr}.`, "success");
  };

  const handleDeleteOp = (id) => {
    const op = operations.find(o => o.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد إلغاء وحذف العملية",
      message: `هل أنت متأكد من إلغاء وحذف عملية المريض (${op?.patientName || ''}) من جدول اليوم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setOperations(prev => prev.filter(o => o.id !== id));
        showToast?.(`تم إزالة عملية المريض ${op?.patientName || ''} بنجاح.`, "success");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  // Add Operation Submit
  const handleAddOpSubmit = (e) => {
    e.preventDefault();
    if (!newOp.patientName || !newOp.surgeon || !newOp.department || !newOp.type || !newOp.room || !newOp.time) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    const newId = operations.length > 0 ? Math.max(...operations.map(o => o.id)) + 1 : 1;
    const opNumber = `OP-00${40 + newId}`;
    const opToAdd = {
      id: newId,
      opNumber: opNumber,
      patientName: newOp.patientName,
      surgeon: newOp.surgeon,
      department: newOp.department,
      room: newOp.room,
      date: newOp.date,
      time: newOp.time,
      status: "scheduled",
      initialLetter: newOp.patientName.charAt(0)
    };

    setOperations(prev => [...prev, opToAdd]);
    setIsModalOpen(false);
    showToast?.(`تم إضافة عملية المريض ${opToAdd.patientName} بنجاح للجدول.`, "success");
    // Reset Form
    setNewOp({
      patientName: "",
      surgeon: "",
      department: "",
      type: "",
      room: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      notes: ""
    });
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
          <h3>إجمالي العمليات اليوم</h3>
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
            <p>{scheduledCount}</p>
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

        <div className="card" style={{ borderBottom: "4px solid var(--accent-amber)" }}>
          <h3>العمليات الجارية</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{activeCount}</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(245, 158, 11, 0.08)", 
              color: "var(--accent-amber)", 
              padding: "10px", 
              borderRadius: "var(--radius-sm)", 
              display: "inline-flex" 
            }}>
              <FaSpinner className={activeCount > 0 ? "fa-spin" : ""} />
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
              onChange={(e) => setSearchPatient(e.target.value)}
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

          <div style={{ position: "relative", minWidth: "150px" }}>
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
            <FaLayerGroup style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px", pointerEvents: "none" }} />
          </div>

          <div style={{ position: "relative", minWidth: "140px" }}>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ paddingRight: "35px", cursor: "pointer", background: "white" }}
            >
              <option value="كل الحالات">كل الحالات</option>
              <option value="مجدولة">مجدولة</option>
              <option value="جارية الآن">جارية الآن</option>
              <option value="مكتملة">مكتملة</option>
              <option value="ملغاة">ملغاة</option>
            </select>
            <FaFilter style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "11px", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="box" style={{ overflow: "visible" }}>
        <h2>قائمة الحالات والعمليات الجراحية</h2>
        <div className="table-container">
          <table style={{ overflow: "visible" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "100px" }}>رقم العملية</th>
                <th style={{ textAlign: "right" }}>اسم المريض</th>
                <th style={{ textAlign: "right" }}>الجراح</th>
                <th style={{ textAlign: "right" }}>القسم</th>
                <th style={{ textAlign: "center" }}>غرفة العمليات</th>
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
                        background: op.initialLetter === "ف" ? "pink" : op.initialLetter === "خ" ? "#d1fae5" : "var(--primary-light)", 
                        color: op.initialLetter === "ف" ? "red" : op.initialLetter === "خ" ? "#065f46" : "var(--primary)", 
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
                    <span className="status" style={{ background: "var(--primary-light)", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <FaDoorClosed style={{ fontSize: "10px" }} /> {op.room}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{op.date}</td>
                  <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{op.time}</td>
                  <td style={{ textAlign: "center" }}>
                    {op.status === "active" && (
                      <span className="status" style={{ background: "var(--accent-amber-light)", color: "#92400e", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "bold" }}>
                        <span style={{ 
                          width: "6px", 
                          height: "6px", 
                          background: "var(--accent-red)", 
                          borderRadius: "50%", 
                          animation: "pulseDot 1.6s infinite" 
                        }}></span>
                        جارية الآن
                      </span>
                    )}
                    {op.status === "scheduled" && (
                      <span className="status" style={{ background: "var(--primary-light)", color: "var(--secondary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", background: "var(--secondary)", borderRadius: "50%" }}></span>
                        مجدولة
                      </span>
                    )}
                    {op.status === "completed" && (
                      <span className="status" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "bold" }}>
                        <span style={{ width: "6px", height: "6px", background: "var(--accent-emerald)", borderRadius: "50%" }}></span>
                        مكتملة
                      </span>
                    )}
                    {op.status === "cancelled" && (
                      <span className="danger" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", background: "var(--accent-red)", borderRadius: "50%" }}></span>
                        ملغاة
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", position: "relative" }}>
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
                          <button onClick={() => handleUpdateStatus(op.id, "completed")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaCircleCheck style={{ color: "var(--accent-emerald)" }} /> مكتملة
                          </button>
                          
                          <button onClick={() => handleActionToast("إعادة جدولة")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaClock style={{ color: "var(--accent-amber)" }} /> إعادة جدولة
                          </button>
                          
                          <button onClick={() => handleUpdateStatus(op.id, "cancelled")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", color: "var(--accent-red)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                            <FaCircleXmark style={{ color: "var(--accent-red)" }} /> إلغاء العملية
                          </button>

                          <div style={{ borderTop: "1px solid var(--bg-main)", paddingTop: "4px", marginTop: "4px" }}>
                            <button onClick={() => handleDeleteOp(op.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", color: "var(--accent-red)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaTrashCan style={{ color: "var(--accent-red)" }} /> حذف من الجدول
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOps.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    ⚠️ لا توجد عمليات مطابقة لخيارات البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                <label>اسم المريض الكامل <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: محمد عبدالله علي" 
                  required
                  value={newOp.patientName}
                  onChange={(e) => setNewOp({ ...newOp, patientName: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>الجراح المعالج <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newOp.surgeon}
                    onChange={(e) => setNewOp({ ...newOp, surgeon: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر الطبيب الجراح</option>
                    {initialDoctorsData.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label>القسم الطبي الموجه له <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newOp.department}
                    onChange={(e) => setNewOp({ ...newOp, department: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر القسم</option>
                    {initialDepartmentsData.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>نوع العملية الجراحية <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="مثال: استئصال الزائدة الدودية" 
                    required
                    value={newOp.type}
                    onChange={(e) => setNewOp({ ...newOp, type: e.target.value })}
                  />
                </div>
                <div>
                  <label>غرفة العمليات <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <select 
                    required
                    value={newOp.room}
                    onChange={(e) => setNewOp({ ...newOp, room: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="" disabled hidden>اختر الغرفة</option>
                    <option value="غرفة 1">غرفة 1</option>
                    <option value="غرفة 2">غرفة 2</option>
                    <option value="غرفة 3">غرفة 3</option>
                    <option value="غرفة 4">غرفة 4</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>التاريخ <span style={{ color: "var(--accent-red)" }}>*</span></label>
                  <input 
                    type="date" 
                    required
                    value={newOp.date}
                    onChange={(e) => setNewOp({ ...newOp, date: e.target.value })}
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

              <div style={{ marginBottom: "25px" }}>
                <label>ملاحظات إضافية</label>
                <textarea 
                  rows="3" 
                  placeholder="أي توصيات أو تفاصيل حول العملية..."
                  value={newOp.notes}
                  onChange={(e) => setNewOp({ ...newOp, notes: e.target.value })}
                  style={{ width: "100%", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn" style={{ background: "var(--primary)" }}>
                  <FaFloppyDisk style={{ marginLeft: "5px" }} /> حفظ العملية
                </button>
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

export default HospitalOperations;
