import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";

const GOVERNORATES = [
  { id: 1, name: "القاهرة" },
  { id: 2, name: "الجيزة" },
  { id: 3, name: "الإسكندرية" },
  { id: 4, name: "القليوبية" },
  { id: 5, name: "الشرقية" },
  { id: 6, name: "الدقهلية" },
  { id: 7, name: "البحيرة" },
  { id: 8, name: "الغربية" },
  { id: 9, name: "المنوفية" },
  { id: 10, name: "كفر الشيخ" },
  { id: 11, name: "دمياط" },
  { id: 12, name: "بورسعيد" },
  { id: 13, name: "الإسماعيلية" },
  { id: 14, name: "السويس" },
  { id: 15, name: "الفيوم" },
  { id: 16, name: "بني سويف" },
  { id: 17, name: "المنيا" },
  { id: 18, name: "أسيوط" },
  { id: 19, name: "سوهاج" },
  { id: 20, name: "قنا" },
  { id: 21, name: "الأقصر" },
  { id: 22, name: "أسوان" },
  { id: 23, name: "البحر الأحمر" },
  { id: 24, name: "الوادي الجديد" },
  { id: 25, name: "مطروح" },
  { id: 26, name: "شمال سيناء" },
  { id: 27, name: "جنوب سيناء" }
];

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
  setLabRequestModalOpen,
  setRadiologyRequestModalOpen,
  setFollowUpModalOpen,
  setAdmissionModalOpen,
  setMedicalReportModalOpen,
  setChronicModalOpen,
  setAllergyModalOpen,
  setMedicationModalOpen,
  setVaccinationModalOpen,
  setSurgeryModalOpen,
  handleDeletePrescription,
  isReadOnly,
  startVisit,
  refreshPatientData,
  onCreateMedicalRecord,
  setVitalSignsModalOpen,
  setAddDiagnosisModalOpen,
  setCloseEncounterModalOpen
}) {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    governorate: "",
    bloodType: "",
    emergencySummary: ""
  });
  const [formValidationError, setFormValidationError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bloodType) {
      setFormValidationError("يرجى اختيار فصيلة الدم.");
      return;
    }
    if (!formData.governorate) {
      setFormValidationError("يرجى اختيار المحافظة.");
      return;
    }
    setFormValidationError("");
    setSubmitting(true);
    const res = await onCreateMedicalRecord(formData);
    setSubmitting(false);
    if (res && res.success) {
      setShowCreateForm(false);
      setFormData({
        governorate: "",
        bloodType: "",
        emergencySummary: ""
      });
    }
  };

  // 1. Loading State
  if (activePatient.medicalRecordState === "loading") {
    return (
      <div id="patientsPage" className="page-content active">
        <div className="topbar">
          <div>
            <h2>👤 الملف الطبي للمريض الحالي</h2>
            <p>السجل الموحد للمواطن - تصفح وتحرير الملف الكامل</p>
          </div>
          <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
        </div>
        <div className="card" style={{ padding: "80px 40px", textAlign: "center", margin: "20px" }}>
          <div className="spinner" style={{ margin: "0 auto 20px", width: "50px", height: "50px", border: "5px solid #f3f3f3", borderTop: "5px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "16px" }}>جاري تحميل الملف الطبي للمريض من السجل الصحي الموحد...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // 2. Error States (401, 403, 500, etc.)
  if (
    activePatient.medicalRecordState === "unauthorized" ||
    activePatient.medicalRecordState === "forbidden" ||
    activePatient.medicalRecordState === "serverError" ||
    activePatient.medicalRecordState === "validationError" ||
    activePatient.medicalRecordState === "error"
  ) {
    return (
      <div id="patientsPage" className="page-content active">
        <div className="topbar">
          <div>
            <h2>👤 الملف الطبي للمريض الحالي</h2>
            <p>السجل الموحد للمواطن - تصفح وتحرير الملف الكامل</p>
          </div>
          <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
        </div>
        <div style={{ padding: "40px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", margin: "20px auto", maxWidth: "600px" }}>
          <span style={{ fontSize: "40px" }}>⚠️</span>
          <h3 style={{ fontWeight: "700", fontSize: "16px", margin: 0 }}>
            {activePatient.medicalRecordErrorMessage || "حدث خطأ أثناء تحميل الملف الطبي."}
          </h3>
          <p style={{ fontSize: "14px", color: "#7f1d1d", margin: 0 }}>
            يرجى التحقق من الاتصال بالشبكة أو صلاحيات الدخول وإعادة المحاولة.
          </p>
          <button className="btn" onClick={refreshPatientData} style={{ background: "var(--accent-red)", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State (No medical record exists)
  if (activePatient.medicalRecordState === "empty") {
    return (
      <div id="patientsPage" className="page-content active">
        <div className="topbar">
          <div>
            <h2>👤 الملف الطبي للمريض الحالي</h2>
            <p>السجل الموحد للمواطن - تصفح وتحرير الملف الكامل</p>
          </div>
          <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
        </div>

        {!showCreateForm ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", maxWidth: "600px", margin: "40px auto", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>📁</div>
            <h3 style={{ fontSize: "18px", color: "var(--text-dark)", marginBottom: "10px" }}>لا يوجد ملف طبي لهذا المريض.</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>المواطن ليس لديه ملف صحي موحد في النظام حالياً. يمكنك إنشاء ملف طبي جديد له الآن.</p>
            
            <button 
              className="btn" 
              onClick={() => setShowCreateForm(true)}
              style={{ background: "var(--primary)", color: "white", padding: "12px 24px", fontSize: "15px", borderRadius: "var(--radius-md)", fontWeight: "bold" }}
            >
              إنشاء ملف طبي
            </button>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: "600px", margin: "30px auto", padding: "30px", borderRadius: "var(--radius-md)", borderRight: "5px solid var(--primary)", textAlign: "right" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--primary)" }}>📂 إنشاء ملف طبي جديد للمريض</h3>
            
            {formValidationError && (
              <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px" }}>
                ⚠️ {formValidationError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>فصيلة الدم <span style={{ color: "red" }}>*</span></label>
                <select 
                  value={formData.bloodType}
                  onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
                >
                  <option value="">اختر فصيلة الدم...</option>
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>المحافظة <span style={{ color: "red" }}>*</span></label>
                <select 
                  value={formData.governorate}
                  onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)" }}
                >
                  <option value="">اختر المحافظة...</option>
                  {GOVERNORATES.map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px" }}>ملخص الحالات الطارئة / الملاحظات الحرجة</label>
                <textarea 
                  rows="4"
                  placeholder="اكتب هنا أي ملاحظات حرجة أو أمراض طارئة للمريض..."
                  value={formData.emergencySummary}
                  onChange={(e) => setFormData({...formData, emergencySummary: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormValidationError("");
                    setFormData({ governorate: "", bloodType: "", emergencySummary: "" });
                  }} 
                  disabled={submitting}
                  style={{ background: "#e2e8f0", color: "#475569", padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ background: "var(--primary)", color: "white", padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  {submitting ? "جاري الإنشاء..." : "حفظ وإنشاء الملف"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

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

      {isReadOnly && (
        <div className="medical-alert warning" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", marginBottom: "25px", borderRadius: "var(--radius-md)", flexWrap: "wrap", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <b style={{ fontSize: "14.5px" }}>ملف المريض مفتوح في وضع القراءة فقط</b>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
                لا يمكنك تعديل هذا الملف أو إضافة كشوفات أو وصفات طبية قبل بدء زيارة طبية نشطة للمريض اليوم.
              </p>
            </div>
          </div>
          <button 
            className="btn" 
            onClick={() => setVisitModalOpen(true)}
            style={{ background: "var(--accent-emerald)", color: "white", padding: "10px 20px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "bold" }}
          >
            🏥 بدء زيارة جديدة
          </button>
        </div>
      )}

      {!isReadOnly && (
        <div className="medical-alert success" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", marginBottom: "25px", borderRadius: "var(--radius-md)", flexWrap: "wrap", gap: "15px", background: "var(--primary-light)", border: "1.5px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🩺</span>
            <div>
              <b style={{ fontSize: "14.5px", color: "var(--primary)" }}>توجد زيارة طبية نشطة للمريض حالياً (الكشف مفتوح)</b>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-dark)", opacity: 0.9 }}>
                يمكنك تسجيل المؤشرات الحيوية، إضافة تشخيصات طبية، أو إنهاء الزيارة وقفل الكشف.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              className="btn" 
              onClick={() => setVitalSignsModalOpen(true)}
              style={{ background: "var(--secondary)", color: "white", padding: "8px 16px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "bold", fontSize: "13.5px" }}
            >
              📊 تسجيل المؤشرات الحيوية
            </button>
            <button 
              className="btn" 
              onClick={() => setAddDiagnosisModalOpen(true)}
              style={{ background: "var(--accent-purple)", color: "white", padding: "8px 16px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "bold", fontSize: "13.5px" }}
            >
              🔍 إضافة تشخيص (ICD-10)
            </button>
            <button 
              className="btn" 
              onClick={() => setCloseEncounterModalOpen(true)}
              style={{ background: "var(--accent-red)", color: "white", padding: "8px 16px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "bold", fontSize: "13.5px" }}
            >
              🔴 إنهاء وقفل الكشف
            </button>
            <button
              className="btn"
              onClick={() => setMedicalReportModalOpen(true)}
              style={{ background: "var(--primary)", color: "white", padding: "8px 16px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "bold", fontSize: "13.5px" }}
            >
              📝 إنشاء تقرير طبي
            </button>
          </div>
        </div>
      )}

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
              {!isReadOnly && (
                <button className="btn" onClick={() => setPrescriptionModalOpen(true)}>➕ إضافة وصفة علاجية</button>
              )}
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
                            {isOwner && !isReadOnly ? (
                              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
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
            <div className="box-header" style={{ flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ color: "var(--primary)", margin: "0", fontWeight: "700", fontSize: "16px" }}>سجل التحويلات الطبية الصادرة</h3>
              {!isReadOnly && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    onClick={() => setLabRequestModalOpen(true)}
                    style={{ fontSize: "13px", padding: "8px 14px", background: "var(--secondary)" }}
                  >
                    🧪 طلب تحليل
                  </button>
                  <button
                    className="btn"
                    onClick={() => setRadiologyRequestModalOpen(true)}
                    style={{ fontSize: "13px", padding: "8px 14px", background: "var(--accent-purple)" }}
                  >
                    🩻 طلب أشعة
                  </button>
                  <button
                    className="btn"
                    onClick={() => setFollowUpModalOpen(true)}
                    style={{ fontSize: "13px", padding: "8px 14px", background: "var(--accent-emerald)" }}
                  >
                    📅 متابعة طبية
                  </button>
                  <button
                    className="btn"
                    onClick={() => setAdmissionModalOpen(true)}
                    style={{ fontSize: "13px", padding: "8px 14px", background: "var(--accent-amber)" }}
                  >
                    🏥 دخول مستشفى
                  </button>
                </div>
              )}
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
