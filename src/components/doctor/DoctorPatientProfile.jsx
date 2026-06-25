import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";


function DoctorPatientProfile({
  activePatient,
  patients,
  doctorInfo,
  patientSearch,
  patientSearchOpen,
  handleSearchPatient,
  handleSelectSearchPatient,
  handleStatusChange,
  activeSubTab,
  setActiveSubTab,
  setVisitModalOpen,
  setPrescriptionModalOpen,
  setReferralModalOpen,
  setChronicModalOpen,
  setEditPrescriptionState,
  handleDeletePrescription
}) {
  return (
    <div id="patientsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>👤 الملف الطبي للمريض الحالي</h2>
          <p>السجل الموحد للمواطن - تصفح وتحرير الملف الكامل</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative", width: "280px", boxSizing: "border-box" }}>
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو Health ID..." 
              value={patientSearch}
              onChange={(e) => handleSearchPatient(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box" }} 
            />
            {patientSearchOpen && (
              <div style={{ display: "block", position: "absolute", top: "100%", right: "0", left: "0", background: "white", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: "100", maxHeight: "200px", overflowY: "auto", marginTop: "5px" }}>
                {Object.keys(patients)
                  .filter(id => id.toLowerCase().includes(patientSearch.toLowerCase()) || patients[id].name.toLowerCase().includes(patientSearch.toLowerCase()))
                  .map(id => (
                    <div 
                      key={id}
                      onClick={() => handleSelectSearchPatient(id)} 
                      style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid var(--border-color)", textAlign: "right", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary-light)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>{patients[id].name}</span>
                      <span style={{ fontFamily: "Outfit", fontSize: "12px", background: "var(--primary-light)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px" }}>{id}</span>
                    </div>
                  ))}
                {Object.keys(patients).filter(id => id.toLowerCase().includes(patientSearch.toLowerCase()) || patients[id].name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                  <div style={{ padding: "12px", fontSize: "13.5px", color: "var(--text-muted)", textAlign: "center" }}>لا توجد نتائج مطابقة</div>
                )}
              </div>
            )}
          </div>
          <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
        </div>
      </div>

      <div id="smart-alerts-container" style={{ display: activePatient.alerts && activePatient.alerts.length > 0 ? "flex" : "none", flexDirection: "column", gap: "10px", marginBottom: "25px" }}>
        {activePatient.alerts && activePatient.alerts.map((alertItem, idx) => (
          <div key={idx} className={`medical-alert ${alertItem.level === 'danger' ? 'danger' : alertItem.level === 'warning' ? 'warning' : 'info'}`}>
            <span className="medical-alert-icon">{alertItem.level === 'danger' ? '🚨' : alertItem.level === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span>{alertItem.text}</span>
          </div>
        ))}
      </div>

      <div className="quick-medical-view" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card card-active-patient" style={{ borderRight: "5px solid var(--primary)", background: "linear-gradient(135deg, white 0%, #fafbfc 100%)" }}>
          <h3 style={{ color: "var(--primary)" }}>👤 المريض النشط</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0 2px 0", flexWrap: "wrap" }}>
            <p style={{ fontSize: "22px", color: "var(--primary)", margin: "0", fontWeight: "700" }}>{activePatient.name}</p>
            <div className="status-select-wrapper" style={{ position: "relative", display: "inline-block" }}>
              <select 
                id="q-status-select" 
                className={`status-select ${activePatient.status || 'stable'}`} 
                value={activePatient.status || "stable"}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ paddingLeft: "30px", paddingRight: "16px", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
              >
                <option value="stable">🟢 مستقر</option>
                <option value="observation">🟡 تحت الملاحظة</option>
                <option value="critical">🔴 حالة حرجة</option>
              </select>
              <span className="select-arrow" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "10px", color: "currentColor", opacity: 0.7 }}>▼</span>
            </div>
          </div>
          <span style={{ fontFamily: "Outfit", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>{activePatient.id}</span>
        </div>
        
        <div className="card card-blood-group" style={{ borderRight: "5px solid var(--accent-red)", background: "linear-gradient(135deg, white 0%, #fffbfb 100%)" }}>
          <h3 style={{ color: "var(--accent-red)" }}>🩸 فصيلة الدم</h3>
          <p style={{ fontSize: "34px", color: "var(--accent-red)", margin: "8px 0 0 0", fontWeight: "800", fontFamily: "Outfit" }}>{activePatient.bloodType}</p>
        </div>

        <div className="card card-allergies" style={{ borderRight: "5px solid var(--accent-amber)", background: "linear-gradient(135deg, white 0%, #fffdfa 100%)" }}>
          <h3 style={{ color: "var(--accent-amber)" }}>⚠️ الحساسية الدوائية</h3>
          <p style={{ fontSize: "14.5px", color: "#b45309", fontWeight: "bold", margin: "12px 0 0 0", minHeight: "45px", display: "flex", alignItems: "center", lineHeight: "1.4" }}>{activePatient.allergies}</p>
        </div>

        <div className="card card-chronic" style={{ borderRight: "5px solid var(--accent-purple)", background: "linear-gradient(135deg, white 0%, #faf9ff 100%)", position: "relative" }}>
          <h3 style={{ color: "var(--accent-purple)" }}>🧠 الأمراض المزمنة</h3>
          <p style={{ fontSize: "13.5px", color: "#5b21b6", fontWeight: "bold", margin: "12px 0 0 0", minHeight: "45px", display: "flex", alignItems: "center", paddingLeft: "20px", lineHeight: "1.4" }}>{activePatient.chronicDiseases || "لا توجد أمراض مزمنة مسجلة"}</p>
          <button onClick={() => setChronicModalOpen(true)} style={{ position: "absolute", bottom: "8px", left: "8px", fontSize: "9.5px", padding: "4px 8px", background: "var(--accent-purple-light)", color: "#6b21a8", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", transition: "var(--transition)" }}>✏️ طلب تحديث</button>
        </div>

        <div className="card card-last-visit" style={{ borderRight: "5px solid var(--accent-emerald)", background: "linear-gradient(135deg, white 0%, #fafdfb 100%)" }}>
          <h3 style={{ color: "var(--accent-emerald)" }}>📅 آخر زيارة</h3>
          <p style={{ fontSize: "20px", color: "#065f46", margin: "14px 0 0 0", fontWeight: "700", fontFamily: "Outfit" }}>{activePatient.lastVisit}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "30px", borderRight: "5px solid var(--secondary)", background: "linear-gradient(135deg, white 0%, #f9faff 100%)" }}>
        <h3 style={{ color: "var(--secondary)", marginBottom: "5px" }}>💊 الأدوية الموثقة حالياً</h3>
        <p style={{ fontSize: "15px", color: "#1e40af", fontWeight: "bold", margin: "0", lineHeight: "1.4" }}>{activePatient.currentMedications || "لا توجد أدوية حالية مسجلة"}</p>
      </div>

      <div className="tabs-container">
        <div className={`tab-header ${activeSubTab === 'visits-tab' ? 'active' : ''}`} onClick={() => setActiveSubTab('visits-tab')}>📂 الزيارات الطبية</div>
        <div className={`tab-header ${activeSubTab === 'prescriptions-tab' ? 'active' : ''}`} onClick={() => setActiveSubTab('prescriptions-tab')}>💊 الوصفات العلاجية</div>
        <div className={`tab-header ${activeSubTab === 'referrals-tab' ? 'active' : ''}`} onClick={() => setActiveSubTab('referrals-tab')}>🏥 التحويلات الطبية</div>
      </div>

      {activeSubTab === "visits-tab" && (
        <div id="visits-tab" className="tab-content active">
          <div className="box" style={{ boxShadow: "none", border: "none", padding: "10px 0 0", background: "transparent" }}>
            <div className="box-header">
              <h3 style={{ color: "var(--primary)", margin: "0", fontWeight: "700", fontSize: "16px" }}>سجل الزيارات والتشخيصات السريرية</h3>
              <button className="btn" onClick={() => setVisitModalOpen(true)}>➕ إضافة كشف جديد</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>التشخيص</th>
                    <th>الأعراض</th>
                    <th>العلاج</th>
                    <th>الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {activePatient.visits.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", color: "#6b7280", padding: "25px" }}>لا توجد زيارات مسجلة للمريض.</td></tr>
                  ) : (
                    activePatient.visits.map((v, idx) => (
                      <tr key={idx}>
                        <td><b>{v.date}</b></td>
                        <td><span style={{ color: "var(--primary)", fontWeight: "bold" }}>{v.diagnosis}</span></td>
                        <td>{v.symptoms}</td>
                        <td><span style={{ color: "var(--accent-emerald)", fontWeight: "bold" }}>{v.treatment}</span></td>
                        <td><small style={{ color: "var(--text-muted)", fontSize: "12px" }}>{v.notes || '-'}</small></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "prescriptions-tab" && (
        <div id="prescriptions-tab" className="tab-content active">
          <div className="box" style={{ boxShadow: "none", border: "none", padding: "10px 0 0", background: "transparent" }}>
            <div className="box-header">
              <h3 style={{ color: "var(--primary)", margin: "0", fontWeight: "700", fontSize: "16px" }}>الوصفات الطبية الصادرة للمواطن</h3>
              <button className="btn" onClick={() => setPrescriptionModalOpen(true)}>➕ إضافة وصفة علاجية</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>اسم الدواء</th>
                    <th>الجرعة وطريقة الاستعمال</th>
                    <th>مدة العلاج</th>
                    <th>تاريخ الوصفة</th>
                    <th>الطبيب المعالج</th>
                    <th>الخيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {activePatient.prescriptions.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: "center", color: "#6b7280", padding: "25px" }}>لا توجد وصفات طبية مسجلة.</td></tr>
                  ) : (
                    activePatient.prescriptions.map((pr, idx) => {
                      const isOwner = pr.doctorId === doctorInfo.employeeId;
                      return (
                        <tr key={idx}>
                          <td><span style={{ color: "var(--accent-purple)", fontWeight: "bold" }}>{pr.name}</span></td>
                          <td>{pr.dosage}</td>
                          <td><span style={{ color: "var(--secondary)", fontWeight: "bold" }}>{pr.duration}</span></td>
                          <td><small style={{ fontFamily: "Outfit" }}>{pr.date}</small></td>
                          <td>
                            <span style={{ fontWeight: "600", color: "var(--text-dark)" }}>
                              {pr.doctorName || "د. أحمد محمد"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isOwner ? (
                              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button 
                                  onClick={() => setEditPrescriptionState({ index: idx, prescription: pr })}
                                  style={{ background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "15px" }}
                                  title="تعديل الوصفة"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeletePrescription(idx)}
                                  style={{ background: "transparent", border: "none", color: "var(--accent-red)", cursor: "pointer", fontSize: "15px" }}
                                  title="حذف الوصفة"
                                >
                                  🗑️
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: "11px", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                🔒 للقراءة فقط
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "referrals-tab" && (
        <div id="referrals-tab" className="tab-content active">
          <div className="box" style={{ boxShadow: "none", border: "none", padding: "10px 0 0", background: "transparent" }}>
            <div className="box-header">
              <h3 style={{ color: "var(--primary)", margin: "0", fontWeight: "700", fontSize: "16px" }}>سجل التحويلات الطبية الصادرة</h3>
              <button className="btn" onClick={() => setReferralModalOpen(true)}>➕ إنشاء تحويل جديد</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>تاريخ التحويل</th>
                    <th>نوع التحويل</th>
                    <th>الجهة المحوّل إليها</th>
                    <th>سبب التحويل</th>
                    <th>ملاحظات إضافية</th>
                  </tr>
                </thead>
                <tbody>
                  {!activePatient.referrals || activePatient.referrals.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", color: "#6b7280", padding: "25px" }}>لا توجد تحويلات سابقة مسجلة للمريض.</td></tr>
                  ) : (
                    activePatient.referrals.map((r, idx) => (
                      <tr key={idx}>
                        <td><b>{r.date}</b></td>
                        <td><span className="status" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: "12px" }}>{r.type}</span></td>
                        <td><span style={{ color: "var(--text-dark)", fontWeight: "bold" }}>{r.destination}</span></td>
                        <td>{r.reason}</td>
                        <td><small style={{ color: "var(--text-muted)" }}>{r.notes || '-'}</small></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="box" style={{ marginTop: "30px" }}>
        <h2>⏳ الخط الزمني الطبي</h2>
        <div className="timeline-container" id="patient-timeline" style={{ maxHeight: "350px", overflowY: "auto", padding: "10px 5px" }}>
          {activePatient.timeline && activePatient.timeline.length > 0 ? (
            <div className="timeline-container">
              {activePatient.timeline.map((item, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-badge">{item.icon || '🩺'}</div>
                  <div className="timeline-content">
                    <div className="timeline-year">{item.year}</div>
                    <div className="timeline-text">{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>لا يوجد خط زمني مسجل للمريض.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatientProfile;
