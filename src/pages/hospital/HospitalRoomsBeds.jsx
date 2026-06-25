import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";

import { 
  FaBed, 
  FaCheck, 
  FaXmark, 
  FaHospital, 
  FaDoorClosed, 
  FaDoorOpen, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaFilter, 
  FaChevronDown, 
  FaRegBell,
  FaCircleInfo,
  FaWrench,
  FaRightLeft,
  FaRegEye,
  FaUsers,
  FaFileInvoice,
  FaTrashCan,
  FaBedPulse
} from "react-icons/fa6";
import { initialRoomsData } from "../../data/hospital/rooms";
import { initialDepartmentsData } from "../../data/hospital/departments";
import ConfirmModal from "../../components/common/ConfirmModal";

function HospitalRoomsBeds({ showToast }) {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem("hospital_rooms");
    return saved ? JSON.parse(saved) : initialRoomsData;
  });

  useEffect(() => {
    localStorage.setItem("hospital_rooms", JSON.stringify(rooms));
  }, [rooms]);
  const [viewMode, setViewMode] = useState("rooms"); // "rooms" | "beds"
  const [searchTerm, setSearchTerm] = useState("");
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

  // New Room Form State
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    department: "",
    type: "غرفة عادية",
    bedsCount: 2
  });

  // Filter Rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.includes(searchTerm) || room.type.includes(searchTerm);
    const matchesDept = selectedDept === "كل الأقسام" || room.department === selectedDept;
    
    let matchesStatus = true;
    if (selectedStatus !== "كل الحالات") {
      if (selectedStatus === "ممتلئة") matchesStatus = room.status === "full";
      else if (selectedStatus === "جزئي") matchesStatus = room.status === "partial";
      else if (selectedStatus === "متاحة") matchesStatus = room.status === "available";
    }
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Bed details list derived from rooms for "View Beds" tab
  const derivedBeds = [];
  rooms.forEach(room => {
    for (let i = 1; i <= room.occupied + room.available; i++) {
      const bedLetter = String.fromCharCode(64 + i); // A, B, C...
      const isOccupied = i <= room.occupied;
      derivedBeds.push({
        id: `${room.roomNumber}-${bedLetter}`,
        roomNumber: room.roomNumber,
        department: room.department,
        bedNumber: `${room.roomNumber}-${bedLetter}`,
        status: isOccupied ? "occupied" : "available",
        patient: isOccupied ? "مريض مقيم" : "لا يوجد"
      });
    }
  });

  const filteredBeds = derivedBeds.filter(bed => {
    const matchesSearch = bed.bedNumber.includes(searchTerm) || bed.roomNumber.includes(searchTerm);
    const matchesDept = selectedDept === "كل الأقسام" || bed.department === selectedDept;
    
    let matchesStatus = true;
    if (selectedStatus !== "كل الحالات") {
      if (selectedStatus === "ممتلئة") matchesStatus = bed.status === "occupied";
      else if (selectedStatus === "متاحة") matchesStatus = bed.status === "available";
    }
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Room status Arabic label helper
  const getRoomStatusBadge = (status) => {
    switch (status) {
      case "full":
        return <span className="danger">ممتلئة</span>;
      case "partial":
        return <span className="status" style={{ background: "var(--accent-amber-light)", color: "#92400e" }}>جزئي</span>;
      case "available":
        return <span className="status">متاحة</span>;
      default:
        return <span className="status">متاحة</span>;
    }
  };

  // Occupancy rate progress bar color
  const getProgressBarColor = (rate) => {
    if (rate >= 100) return "var(--accent-red)";
    if (rate >= 50) return "var(--accent-amber)";
    return "var(--accent-emerald)";
  };

  // Row Action Handlers
  const handleMaintenanceToggle = (id) => {
    let roomNum = "";
    let isMaintenanceNow = false;
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        const isMaintenance = r.status === "maintenance";
        roomNum = r.roomNumber;
        isMaintenanceNow = !isMaintenance;
        return { 
          ...r, 
          status: isMaintenance ? "available" : "maintenance",
          occupancyRate: isMaintenance ? 0 : r.occupancyRate
        };
      }
      return r;
    }));
    setActiveDropdownId(null);
    showToast?.(`تم تحديث الحالة الفنية للغرفة ${roomNum} إلى: ${isMaintenanceNow ? "صيانة 🛠️" : "متاحة للخدمة 🟢"}.`, "success");
  };

  const handleDeleteRoom = (id) => {
    const room = rooms.find(r => r.id === id);
    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف الغرفة",
      message: `هل أنت متأكد من حذف الغرفة (${room?.roomNumber || ''}) وجميع الأسرة التابعة لها نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setRooms(prev => prev.filter(r => r.id !== id));
        showToast?.(`تم حذف الغرفة ${room?.roomNumber || ''} بنجاح.`, "success");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setActiveDropdownId(null);
  };

  const handleActionToast = (actionName) => {
    showToast?.(`سيتم فتح نافذة (${actionName}) للغرفة المحددة قريباً.`, "info");
    setActiveDropdownId(null);
  };

  // Add Room Submit
  const handleAddRoomSubmit = (e) => {
    e.preventDefault();
    if (!newRoom.roomNumber || !newRoom.department) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
    const roomToAdd = {
      id: newId,
      roomNumber: newRoom.roomNumber,
      department: newRoom.department,
      type: newRoom.type,
      occupied: 0,
      available: Number(newRoom.bedsCount) || 2,
      occupancyRate: 0,
      status: "available"
    };

    setRooms(prev => [...prev, roomToAdd]);
    setIsModalOpen(false);
    showToast?.(`تم إضافة الغرفة ${roomToAdd.roomNumber} بنجاح.`, "success");
    // Reset Form
    setNewRoom({
      roomNumber: "",
      department: "",
      type: "غرفة عادية",
      bedsCount: 2
    });
  };

  return (
    <div id="hospitalRoomsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>الغرف والأسرة 🚪</h2>
          <p>إدارة الطاقة الاستيعابية للمستشفى ومتابعة توزيع الغرف والأسرة الفعالة</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Tools Section */}
      <div className="filters-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", smWidth: "auto", flex: 1 }}>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus style={{ marginLeft: "5px" }} />
            إضافة غرفة جديدة
          </button>
          
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

          <div style={{ position: "relative", minWidth: "140px" }}>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ paddingRight: "35px", cursor: "pointer", background: "white" }}
            >
              <option value="كل الحالات">كل الحالات</option>
              <option value="ممتلئة">{viewMode === "rooms" ? "ممتلئة" : "مشغولة"}</option>
              {viewMode === "rooms" && <option value="جزئي">إشغال جزئي</option>}
              <option value="متاحة">متاحة</option>
            </select>
            <FaCircleInfo style={{ 
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
              placeholder={viewMode === "rooms" ? "بحث عن غرفة..." : "بحث عن سرير..."} 
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

      {/* KPI Cards */}
      <div className="cards">
        {/* Circle Occupancy Card */}
        <div className="card" style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div style={{ position: "relative", width: "55px", height: "55px", flexShrink: 0 }}>
            <div style={{ 
              width: "100%", 
              height: "100%", 
              borderRadius: "50%", 
              border: "4px solid var(--border-color)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "12.5px",
              fontFamily: "Outfit" 
            }}>
              69%
            </div>
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              borderRadius: "50%", 
              border: "4px solid var(--accent-amber)", 
              borderTopColor: "transparent", 
              borderLeftColor: "transparent",
              pointerEvents: "none" 
            }}></div>
          </div>
          <div>
            <h3>نسبة الإشغال الكلية</h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>إشغال أسرة التنويم</span>
          </div>
        </div>

        <div className="card">
          <h3>الأسرة المتاحة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>126</p>
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
          <h3>الأسرة المشغولة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>286</p>
            <span style={{ 
              fontSize: "24px", 
              background: "rgba(239, 68, 68, 0.08)", 
              color: "var(--accent-red)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaBed />
            </span>
          </div>
        </div>

        <div className="card">
          <h3>إجمالي الغرف</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>128</p>
            <span style={{ 
              fontSize: "24px", 
              background: "var(--primary-glow)", 
              color: "var(--secondary)", 
              padding: "10px", 
              borderRadius: "50%", 
              display: "inline-flex" 
            }}>
              <FaDoorClosed />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="tabs-container" style={{ margin: "25px 0 15px 0" }}>
        <div 
          className={`tab-header ${viewMode === "rooms" ? "active" : ""}`}
          onClick={() => setViewMode("rooms")}
        >
          عرض الغرف
        </div>
        <div 
          className={`tab-header ${viewMode === "beds" ? "active" : ""}`}
          onClick={() => setViewMode("beds")}
        >
          عرض الأسرة
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === "rooms" ? (
        <div className="box" style={{ overflow: "visible" }}>
          <h2>سجل الغرف الاستيعابية</h2>
          <div className="table-container">
            <table style={{ overflow: "visible" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", width: "60px" }}>#</th>
                  <th style={{ textAlign: "center" }}>رقم الغرفة</th>
                  <th style={{ textAlign: "right" }}>القسم</th>
                  <th style={{ textAlign: "right" }}>نوع الغرفة</th>
                  <th style={{ textAlign: "center" }}>الأسرة المشغولة</th>
                  <th style={{ textAlign: "center" }}>الأسرة المتاحة</th>
                  <th style={{ textAlign: "right", width: "160px" }}>معدل الإشغال</th>
                  <th style={{ textAlign: "center" }}>الحالة</th>
                  <th style={{ textAlign: "center", width: "110px" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room, idx) => (
                  <tr key={room.id}>
                    <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)" }}>
                        <FaDoorClosed /> {room.roomNumber}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "var(--text-dark)" }}>{room.department}</td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)" }}>{room.type}</td>
                    <td style={{ textAlign: "center", fontFamily: "Outfit", fontWeight: "600" }}>{room.occupied}</td>
                    <td style={{ textAlign: "center", fontFamily: "Outfit", fontWeight: "600" }}>{room.available}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", fontFamily: "Outfit", width: "35px", display: "inline-block", textAlign: "left" }}>
                          {room.occupancyRate}%
                        </span>
                        <div style={{ flex: 1, background: "var(--border-color)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ 
                            background: getProgressBarColor(room.occupancyRate), 
                            width: `${room.occupancyRate}%`, 
                            height: "100%" 
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {room.status === "maintenance" ? (
                        <span className="danger" style={{ background: "rgba(245,158,11,0.1)", color: "var(--accent-amber)" }}>تحت الصيانة</span>
                      ) : (
                        getRoomStatusBadge(room.status)
                      )}
                    </td>
                    <td style={{ textAlign: "center", position: "relative" }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === room.id ? null : room.id);
                        }}
                        style={{ padding: "6px 14px", fontWeight: "bold" }}
                      >
                        إجراءات <FaChevronDown style={{ fontSize: "8px", marginRight: "4px" }} />
                      </button>
                      
                      {/* Action Dropdown Menu */}
                      {activeDropdownId === room.id && (
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
                            <button onClick={() => handleActionToast("تفاصيل الغرفة")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaRegEye style={{ color: "var(--secondary)" }} /> عرض تفاصيل الغرفة
                            </button>
                            <button onClick={() => { setViewMode("beds"); setSearchTerm(room.roomNumber); setActiveDropdownId(null); }} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaBed style={{ color: "var(--accent-purple)" }} /> عرض الأسرة
                            </button>
                            <button onClick={() => handleActionToast("إضافة سرير")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaPlus style={{ color: "var(--accent-emerald)" }} /> إضافة سرير للغرفة
                            </button>

                            <div style={{ borderTop: "1px solid var(--bg-main)", paddingTop: "4px", marginTop: "4px" }}>
                              <button onClick={() => handleActionToast("نقل مريض")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                                <FaRightLeft style={{ color: "var(--accent-amber)" }} /> نقل مريض للغرفة
                              </button>
                              <button onClick={() => handleMaintenanceToggle(room.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                                <FaWrench style={{ color: "var(--accent-amber)" }} /> 
                                {room.status === "maintenance" ? "إلغاء الصيانة للغرفة" : "وضع الغرفة تحت الصيانة"}
                              </button>
                              <button onClick={() => handleActionToast("المرضى الحاليين")} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                                <FaUsers style={{ color: "var(--primary)" }} /> عرض المرضى الموجودين
                              </button>
                            </div>

                            <div style={{ borderTop: "1px solid var(--bg-main)", paddingTop: "4px", marginTop: "4px" }}>
                              <button onClick={() => handleDeleteRoom(room.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", color: "var(--accent-red)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                                <FaTrashCan style={{ color: "var(--accent-red)" }} /> حذف الغرفة
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      ⚠️ لا يوجد غرف مطابقة لخيارات التصفية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="box">
          <h2>قائمة الأسرة وتوزيع الحالات</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", width: "60px" }}>#</th>
                  <th style={{ textAlign: "center" }}>رمز السرير</th>
                  <th style={{ textAlign: "center" }}>رقم الغرفة</th>
                  <th style={{ textAlign: "right" }}>القسم</th>
                  <th style={{ textAlign: "center" }}>الحالة</th>
                  <th style={{ textAlign: "right" }}>الشاغل الحالي</th>
                  <th style={{ textAlign: "center", width: "120px" }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map((bed, idx) => (
                  <tr key={bed.id}>
                    <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ textAlign: "center", fontWeight: "700", color: "var(--primary)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <FaBedPulse /> {bed.bedNumber}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{bed.roomNumber}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>{bed.department}</td>
                    <td style={{ textAlign: "center" }}>
                      {bed.status === "occupied" ? (
                        <span className="danger" style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)" }}>مشغول</span>
                      ) : (
                        <span className="status">متاح شاغر</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", color: bed.status === "occupied" ? "var(--text-dark)" : "var(--text-muted)" }}>
                      {bed.patient}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleActionToast(`إدارة السرير ${bed.bedNumber}`)}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        إدارة السرير
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBeds.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      ⚠️ لا يوجد أسرة مطابقة لخيارات البحث.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ width: "500px" }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 style={{ color: "var(--primary)", marginTop: "0", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", fontWeight: "700", fontSize: "18px" }}>
              ➕ إضافة غرفة استيعابية جديدة
            </h2>
            <form onSubmit={handleAddRoomSubmit} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label>رقم الغرفة <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: 105، 206..." 
                  required
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>القسم الطبي <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <select 
                  required
                  value={newRoom.department}
                  onChange={(e) => setNewRoom({ ...newRoom, department: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="" disabled hidden>اختر القسم</option>
                  {initialDepartmentsData.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                <div>
                  <label>نوع الغرفة</label>
                  <select 
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="غرفة عادية">غرفة عادية</option>
                    <option value="غرفة مزدوجة">غرفة مزدوجة</option>
                    <option value="غرفة خاصة">غرفة خاصة</option>
                    <option value="العناية المركزة">العناية المركزة</option>
                  </select>
                </div>
                <div>
                  <label>عدد الأسرة الكلي بالحد الأقصى</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="2"
                    value={newRoom.bedsCount}
                    onChange={(e) => setNewRoom({ ...newRoom, bedsCount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn">حفظ الغرفة</button>
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

export default HospitalRoomsBeds;
