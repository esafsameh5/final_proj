import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";
import api from "../../utils/api";

import { 
  FaBed, 
  FaCheck, 
  FaXmark, 
  FaHospital, 
  FaDoorClosed, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaFilter, 
  FaCircleInfo, 
  FaBedPulse,
  FaSpinner
} from "react-icons/fa6";

function mapRoomTypeToArabic(type) {
  switch (type) {
    case "Standard": return "غرفة عادية";
    case "Private": return "غرفة خاصة";
    case "ICU": return "العناية المركزة";
    case "Operation": return "غرفة العمليات";
    case "Emergency": return "الطوارئ";
    case "Isolation": return "غرفة عزل";
    default: return type || "أخرى";
  }
}

function mapBedStatusToArabic(status) {
  switch (status) {
    case "Available": return "متاح شاغر";
    case "Occupied": return "مشغول";
    case "Reserved": return "محجوز";
    case "Cleaning": return "تنظيف";
    case "Maintenance": return "صيانة";
    case "OutOfService": return "خارج الخدمة";
    default: return status || "متاح";
  }
}

function HospitalRoomsBeds({ showToast }) {
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [dbDepts, setDbDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [viewMode, setViewMode] = useState("rooms"); // "rooms" | "beds"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("كل الأقسام");
  const [selectedStatus, setSelectedStatus] = useState("كل الحالات");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // New Room Form State
  const [newRoom, setNewRoom] = useState({
    departmentId: "",
    type: "Standard"
  });

  const facilityId = sessionStorage.getItem("facilityId") || "f203157f-0975-4bcf-b8c7-48c2fba672bf";

  // Fetch Rooms & Beds & Departments
  const fetchRoomsAndBeds = async () => {
    setLoading(true);
    setError(false);
    try {
      // 1. Fetch Rooms
      const roomsRes = await api.get(`/api/v1/facilities/${facilityId}/rooms`, {
        params: { IncludeInactive: true }
      });
      const roomsData = roomsRes.data?.data?.items || roomsRes.data?.data || [];
      
      // 2. Fetch Beds
      const bedsRes = await api.get(`/api/v1/facilities/${facilityId}/beds`, {
        params: { IncludeInactive: true, PageSize: 100 }
      });
      const bedsData = bedsRes.data?.data?.items || bedsRes.data?.data || [];

      // 3. Fetch Departments
      const deptsRes = await api.get(`/api/v1/facilities/${facilityId}/departments`, {
        params: { PageSize: 100 }
      });
      setDbDepts(deptsRes.data?.data?.items || []);

      // Map beds list
      const mappedBeds = bedsData.map(b => ({
        id: b.bedId || b.id || "",
        roomId: b.roomId || "",
        bedNumber: b.bedNumber || b.code || "سرير",
        status: b.status || "Available",
        patient: b.patientDisplayName || b.patientName || "لا يوجد",
        roomNumber: b.roomNumber || b.roomCode || "غير محدد",
        department: b.departmentName || b.medicalDepartmentName || "الجراحة العامة"
      }));
      setBeds(mappedBeds);

      // Map rooms list (calculating beds from the beds list)
      const mappedRooms = roomsData.map(r => {
        const roomBeds = mappedBeds.filter(b => b.roomId === r.roomId || b.roomId === r.id);
        const occupied = roomBeds.filter(b => b.status === "Occupied").length;
        const available = roomBeds.filter(b => b.status === "Available").length;
        const total = roomBeds.length;
        const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        
        let status = "available";
        if (total > 0 && occupied === total) status = "full";
        else if (occupied > 0) status = "partial";

        return {
          id: r.roomId || r.id || "",
          roomNumber: r.roomNumber || r.code || `غرفة ${r.roomId ? r.roomId.substring(0, 4) : ""}`,
          department: r.departmentName || r.medicalDepartmentName || r.wardName || "الجراحة العامة",
          type: mapRoomTypeToArabic(r.roomType),
          rawType: r.roomType || "Standard",
          occupied,
          available,
          total,
          occupancyRate: rate,
          status
        };
      });
      setRooms(mappedRooms);

    } catch (err) {
      console.error("Failed to load rooms and beds:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndBeds();
  }, []);

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

  // Filter Beds
  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedNumber.includes(searchTerm) || bed.roomNumber.includes(searchTerm);
    const matchesDept = selectedDept === "كل الأقسام" || bed.department === selectedDept;
    
    let matchesStatus = true;
    if (selectedStatus !== "كل الحالات") {
      if (selectedStatus === "ممتلئة") matchesStatus = bed.status === "Occupied";
      else if (selectedStatus === "متاحة") matchesStatus = bed.status === "Available";
    }
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // KPI Calculations
  const totalBedsCount = beds.length;
  const occupiedBedsCount = beds.filter(b => b.status === "Occupied").length;
  const availableBedsCount = beds.filter(b => b.status === "Available").length;
  const overallOccupancyRate = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;

  // Occupancy rate progress bar color
  const getProgressBarColor = (rate) => {
    if (rate >= 100) return "var(--accent-red)";
    if (rate >= 50) return "var(--accent-amber)";
    return "var(--accent-emerald)";
  };

  // Add Bed to Room (POST /api/v1/facilities/beds)
  const handleAddBed = async (roomId) => {
    try {
      await api.post("/api/v1/facilities/beds", { roomId });
      fetchRoomsAndBeds();
      showToast?.("تم إضافة سرير جديد للغرفة بنجاح.", "success");
    } catch (err) {
      console.error("Failed to add bed:", err);
      showToast?.("فشل إضافة سرير للغرفة.", "danger");
    }
    setActiveDropdownId(null);
  };

  // Update Bed Status (PATCH /api/v1/beds/{id}/status)
  const handleUpdateBedStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/v1/beds/${id}/status`, null, {
        params: { status: newStatus }
      });
      fetchRoomsAndBeds();
      showToast?.("تم تحديث حالة السرير بنجاح.", "success");
    } catch (err) {
      console.error("Failed to update bed status:", err);
      showToast?.("فشل تحديث حالة السرير في الخادم.", "danger");
    }
  };

  // Add Room Submit (POST /api/v1/facilities/rooms)
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.departmentId || !newRoom.type) {
      showToast?.("يرجى ملء جميع الحقول المطلوبة.", "error");
      return;
    }

    try {
      // Create a ward for this department to associate the room with
      const deptName = dbDepts.find(d => d.id === newRoom.departmentId)?.name || "القسم";
      const wardRes = await api.post("/api/v1/facilities/wards", {
        medicalDepartmentId: newRoom.departmentId,
        name: `جناح ${deptName}`
      });
      const wardId = wardRes.data?.data?.wardId;
      if (!wardId) {
        throw new Error("Could not create ward for department.");
      }

      await api.post("/api/v1/facilities/rooms", {
        wardId,
        roomType: newRoom.type
      });
      fetchRoomsAndBeds();
      setIsModalOpen(false);
      showToast?.("تم إضافة الغرفة بنجاح.", "success");
      setNewRoom({ departmentId: "", type: "Standard" });
    } catch (err) {
      console.error("Failed to create room:", err);
      showToast?.("فشل إضافة الغرفة بالخادم الموحد.", "danger");
    }
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
              {overallOccupancyRate}%
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
            <p>{availableBedsCount}</p>
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
            <p>{occupiedBedsCount}</p>
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
            <p>{rooms.length}</p>
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
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <FaSpinner className="spinner" style={{ fontSize: "28px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "12px", fontWeight: "bold" }}>جاري تحميل البيانات...</p>
        </div>
      ) : error ? (
        <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <span style={{ fontWeight: "700" }}>فشل تحميل الغرف والأسرة من الخادم الموحد</span>
          <button className="btn" onClick={fetchRoomsAndBeds} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
        </div>
      ) : viewMode === "rooms" ? (
        <div className="box" style={{ overflow: "visible" }}>
          <h2>سجل الغرف الاستيعابية</h2>
          <div className="table-container">
            <table style={{ overflow: "visible" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", width: "60px" }}>#</th>
                  <th style={{ textAlign: "center" }}>رمز/معرف الغرفة</th>
                  <th style={{ textAlign: "right" }}>القسم / الجناح</th>
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
                      {room.status === "full" ? (
                        <span className="danger">ممتلئة</span>
                      ) : room.status === "partial" ? (
                        <span className="status" style={{ background: "var(--accent-amber-light)", color: "#92400e" }}>جزئي</span>
                      ) : (
                        <span className="status">متاحة</span>
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
                            <button onClick={() => handleAddBed(room.id)} style={{ width: "100%", textAlign: "right", padding: "6px 12px", fontSize: "11.5px", border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "6px" }} className="btn-secondary">
                              <FaPlus style={{ color: "var(--accent-emerald)" }} /> إضافة سرير للغرفة
                            </button>
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
                  <th style={{ textAlign: "center" }}>معرف الغرفة</th>
                  <th style={{ textAlign: "right" }}>القسم</th>
                  <th style={{ textAlign: "center" }}>الحالة</th>
                  <th style={{ textAlign: "right" }}>الشاغل الحالي</th>
                  <th style={{ textAlign: "center", width: "160px" }}>تغيير الحالة</th>
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
                      {bed.status === "Occupied" ? (
                        <span className="danger" style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)" }}>مشغول</span>
                      ) : (
                        <span className="status">{mapBedStatusToArabic(bed.status)}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", color: bed.status === "Occupied" ? "var(--text-dark)" : "var(--text-muted)" }}>
                      {bed.patient}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <select
                        value={bed.status}
                        onChange={(e) => handleUpdateBedStatus(bed.id, e.target.value)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          border: "1px solid var(--border-color)",
                          background: "white",
                          cursor: "pointer"
                        }}
                      >
                        <option value="Available">متاح شاغر</option>
                        <option value="Occupied">مشغول</option>
                        <option value="Reserved">محجوز</option>
                        <option value="Cleaning">تنظيف</option>
                        <option value="Maintenance">صيانة</option>
                        <option value="OutOfService">خارج الخدمة</option>
                      </select>
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
              ➕ إضافة غرفة جديدة للقسم
            </h2>
            <form onSubmit={handleAddRoomSubmit} style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label>القسم الطبي <span style={{ color: "var(--accent-red)" }}>*</span></label>
                <select 
                  required
                  value={newRoom.departmentId}
                  onChange={(e) => setNewRoom({ ...newRoom, departmentId: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="" disabled hidden>اختر القسم</option>
                  {dbDepts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label>نوع الغرفة</label>
                <select 
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="Standard">غرفة عادية</option>
                  <option value="Private">غرفة خاصة</option>
                  <option value="ICU">العناية المركزة</option>
                  <option value="Operation">غرفة عمليات</option>
                  <option value="Emergency">طوارئ</option>
                  <option value="Isolation">عزل طبي</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn">حفظ الغرفة</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalRoomsBeds;
