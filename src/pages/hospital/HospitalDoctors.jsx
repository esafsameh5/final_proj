import React, { useState, useEffect } from "react";
import HeaderUserBadge from "../../components/common/HeaderUserBadge";
import api from "../../utils/api";

import { 
  FaUserDoctor, 
  FaUserGroup, 
  FaMagnifyingGlass, 
  FaFilter, 
  FaSpinner
} from "react-icons/fa6";
import { initialDepartmentsData } from "../../data/hospital/departments";

function HospitalDoctors({ showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("كل الأقسام");

  // Fetch Doctors from backend
  const fetchDoctors = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/api/v1/users", {
        params: {
          role: "Doctor",
          Search: searchTerm || undefined,
          Page: 1,
          PageSize: 100
        }
      });
      if (response.data && response.data.success) {
        const items = response.data.data.items || [];
        const mapped = items.map(user => {
          const dept = user.departmentName || "الجراحة العامة";
          return {
            id: user.userId,
            name: user.displayName || "طبيب غير مسمى",
            department: dept,
            specialty: user.specialty || "طب عام",
            phone: user.phoneNumber || "-",
            status: user.isActive ? "active" : "suspended",
            role: user.roles || "Doctor"
          };
        });
        setDoctors(mapped);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm]);

  // Filter Doctors locally by Department
  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDept === "كل الأقسام" || doc.department === selectedDept;
    return matchesDept;
  });

  return (
    <div id="hospitalDoctorsPage" className="page-content active">
      {/* Topbar Header */}
      <div className="topbar">
        <div>
          <h2>الأطباء والكوادر 🩺</h2>
          <p>عرض سجل الأطباء والتخصصات والأقسام الطبية المسجلة</p>
        </div>
        <HeaderUserBadge name="مدير المستشفى" />
      </div>

      {/* Tools Section */}
      <div className="filters-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", smWidth: "auto", flex: 1 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "15px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>إجمالي الأطباء المسجلين</span>
          <p style={{ margin: "5px 0", fontSize: "24px" }}>{doctors.length}</p>
          <span style={{ display: "inline-flex", background: "var(--primary-glow)", color: "var(--primary)", padding: "6px", borderRadius: "50%", fontSize: "14px" }}>
            <FaUserGroup />
          </span>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="box" style={{ overflow: "visible" }}>
        <h2>سجل الكادر الطبي</h2>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <FaSpinner className="spinner" style={{ fontSize: "28px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", fontWeight: "bold" }}>جاري تحميل سجل الأطباء...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", margin: "20px 0" }}>
            <span style={{ fontWeight: "700" }}>فشل تحميل سجل الأطباء من الخادم الموحد</span>
            <button className="btn" onClick={fetchDoctors} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
            <span style={{ color: "#64748b", fontWeight: "600", display: "block" }}>لا توجد سجلات أطباء مسجلة أو مطابقة للتصفية.</span>
          </div>
        ) : (
          <div className="table-container">
            <table style={{ overflow: "visible" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", width: "60px" }}>#</th>
                  <th style={{ textAlign: "right" }}>اسم الطبيب</th>
                  <th style={{ textAlign: "right" }}>القسم</th>
                  <th style={{ textAlign: "right" }}>التخصص</th>
                  <th style={{ textAlign: "center" }}>رقم الهاتف</th>
                  <th style={{ textAlign: "center" }}>الصلاحية في النظام</th>
                  <th style={{ textAlign: "center" }}>حالة العمل</th>
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
                          {doc.name.replace("د. ", "").replace("د/ ", "").charAt(0)}
                        </div>
                        <span style={{ color: "var(--primary)" }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-dark)", fontWeight: "600" }}>{doc.department}</td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)" }}>{doc.specialty}</td>
                    <td style={{ textAlign: "center", fontFamily: "Outfit" }}>{doc.phone}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="status" style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: "bold" }}>
                        {doc.role}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {doc.status === "active" ? (
                        <span className="status" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)" }}>نشط</span>
                      ) : (
                        <span className="danger" style={{ background: "rgba(239, 68, 68, 0.08)", color: "var(--accent-red)" }}>موقوف</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalDoctors;
