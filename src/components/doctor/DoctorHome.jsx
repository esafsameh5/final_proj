import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";
import { QrCode } from "lucide-react";import { FaWifi } from "react-icons/fa6";

function DoctorHome({
  doctorInfo,
  homeSearch,
  setHomeSearch,
  setQrModalOpen,
  setNfcModalOpen,
  todayVisitsCount,
  patients,
  activePatient,
  handleOpenPatientProfile,
  setVisitModalOpen,
  setPrescriptionModalOpen,
  setActivePage,
  setNewUpload,
  setUploadModalOpen,
  setQuickActivePatientId
}) {
  return (
    <div id="homePage" className="page-content active">
      <div className="topbar">
        <div className="topbar-search-group">
          <input 
            type="text" 
            placeholder="ابحث في قائمة مرضى اليوم..." 
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
          />
          <button className="btn" onClick={() => setQrModalOpen(true)}><QrCode className="his-icon" size={20} strokeWidth={2.2} />
                              مسح رمز QR</button>
          <button className="btn btn-secondary" onClick={() => setNfcModalOpen(true)}><FaWifi className="his-icon" size={18} style={{ transform: "rotate(90deg)" }}/>
                          مسح كارت NFC</button>
        </div>
        <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
      </div>

      <div className="cards">
        <div className="card">
          <h3>مرضى العيادة اليوم</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{Object.keys(patients).length}</p>
            <span style={{ fontSize: "11.5px", background: "var(--accent-emerald-light)", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold", marginBottom: "5px" }}>نشط 🟢</span>
          </div>
        </div>

        <div className="card">
          <h3>عدد المرضى الذين تم الكشف عليهم اليوم</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>{todayVisitsCount}</p>
            <span style={{ fontSize: "11.5px", background: "var(--accent-emerald-light)", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold", marginBottom: "5px" }}>مكتمل 🩺</span>
          </div>
        </div>

        <div className="card">
          <h3>فحوصات معلقة</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p>5</p>
            <span style={{ fontSize: "11.5px", background: "var(--accent-amber-light)", color: "#92400e", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold", marginBottom: "5px" }}>مراجعة ⚠️</span>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="box">
          <h2>مرضى اليوم</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "right", width: "35%" }}>اسم المريض</th>
                  <th style={{ textAlign: "center", width: "15%" }}>السن</th>
                  <th style={{ textAlign: "center", width: "20%" }}>آخر زيارة</th>
                  <th style={{ textAlign: "center", width: "15%" }}>الحالة</th>
                  <th style={{ textAlign: "center", width: "15%" }}>إجراء</th>
                </tr>
              </thead>
              <tbody id="home-patients-tbody">
                {Object.keys(patients)
                  .filter(id => patients[id].name.toLowerCase().includes(homeSearch.toLowerCase()) || id.toLowerCase().includes(homeSearch.toLowerCase()))
                  .map(id => {
                    const p = patients[id];
                    const isSelected = activePatient && activePatient.id === p.id;
                    return (
                      <tr 
                        key={p.id}
                        onClick={() => setQuickActivePatientId(p.id)}
                        style={{ 
                          cursor: "pointer", 
                          background: isSelected ? "var(--primary-light)" : "", 
                          transition: "background 0.2s" 
                        }}
                      >
                        <td style={{ textAlign: "right", fontWeight: "700", color: "var(--primary)" }}>👤 {p.name}</td>
                        <td style={{ textAlign: "center", fontFamily: "Outfit", fontWeight: "600" }}>{p.age}</td>
                        <td style={{ textAlign: "center", fontFamily: "Outfit", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{p.lastVisit}</td>
                        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          {p.status === "stable" && <span className="status">مستقر</span>}
                          {p.status === "observation" && <span className="status" style={{ background: "var(--primary-light)", color: "var(--secondary)" }}>تحت الملاحظة</span>}
                          {p.status === "critical" && <span className="danger">حالة حرجة</span>}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button 
                            className="btn" 
                            style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "var(--radius-sm)", fontWeight: "600" }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatientProfile(p.id);
                            }}
                          >
                            📂 فتح الملف
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="box">
          <h2>سجل المريض النشط السريع</h2>
          {activePatient ? (
            <>
              <div className="patient-card" style={{ borderRight: "4px solid var(--primary)" }}>
                <h3>{activePatient.name}</h3>
                <p><b>Health ID:</b> <span style={{ fontFamily: "Outfit" }}>{activePatient.id}</span></p>
                <p><b>فصيلة الدم:</b> <span style={{ fontWeight: "700", color: "var(--accent-red)" }}>{activePatient.bloodType}</span></p>
                <p><b>الحساسية الدوائية:</b> <span style={{ fontWeight: "600", color: "var(--accent-amber)" }}>{activePatient.allergies}</span></p>
              </div>

              <div className="patient-card" style={{ borderRight: "4px solid var(--accent-purple)" }}>
                <h3>الأمراض المزمنة المسجلة</h3>
                <p>{activePatient.chronicDiseases || "لا توجد أمراض مزمنة مسجلة"}</p>
              </div>

              <div className="patient-card" style={{ borderRight: "4px solid var(--accent-emerald)" }}>
                <h3>آخر تشخيص إكلينيكي</h3>
                <p>{activePatient.visits.length > 0 ? activePatient.visits[0].diagnosis : "لا توجد تشخيصات سابقة"}</p>
              </div>

              <div className="patient-card" style={{ borderRight: "4px solid var(--secondary)" }}>
                <h3>الوصفة الحالية</h3>
                <p>{activePatient.currentMedications || "لا توجد أدوية حالية مسجلة"}</p>
              </div>

              <div className="actions">
                <button onClick={() => handleOpenPatientProfile(activePatient.id)} style={{ background: "var(--primary)", color: "white" }}>📂 فتح ملف المريض الكامل</button>
                <button onClick={() => setVisitModalOpen(true)}>➕ إضافة كشف طبي جديد</button>
                <button onClick={() => setPrescriptionModalOpen(true)}>💊 كتابة وصفة علاجية</button>
                <button onClick={() => { 
                  setNewUpload(prev => ({ ...prev, type: "lab" }));
                  setActivePage("testsPage");
                  setUploadModalOpen(true);
                }}>🧪 طلب تحليل مخبري</button>
                <button onClick={() => { 
                  setNewUpload(prev => ({ ...prev, type: "radiology" }));
                  setActivePage("testsPage");
                  setUploadModalOpen(true);
                }}>🩻 طلب تقرير أشعة</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>يرجى اختيار مريض نشط من القائمة لعرض تفاصيله السريعة.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorHome;
