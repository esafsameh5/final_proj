import React from "react";
import PdfViewer from "../common/PdfViewer";
import HeaderUserBadge from "../common/HeaderUserBadge";


function DoctorTestsLabs({
  activePatient,
  doctorInfo,
  testsSearch,
  setTestsSearch,
  testsUrgentCount,
  testsPendingCount,
  testsCompletedCount,
  activeTestsSubTab,
  setActiveTestsSubTab,
  setNewUpload,
  setUploadModalOpen,
  handleOpenPdf,
  pdfOpen,
  setPdfOpen,
  pdfType,
  renderPdfContent,
  isReadOnly,
  refreshPatientData
}) {
  return (
    <div id="testsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🧪 مكتبة التحاليل والأشعة الطبية</h2>
          <p>مراجعة تقارير الأشعة المرفوعة وملفات الـ PDF للتحاليل الصادرة</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <input 
            type="text" 
            placeholder="ابحث عن تقرير..." 
            value={testsSearch}
            onChange={(e) => setTestsSearch(e.target.value)}
          />
          <HeaderUserBadge name={doctorInfo.name} avatar={doctorInfo.avatar} />
        </div>
      </div>

      <div id="active-patient-tests-banner" style={{ background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)", borderRight: "4px solid var(--secondary)", padding: "12px 20px", borderRadius: "var(--radius-md)", marginBottom: "25px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", fontWeight: "600", color: "var(--text-dark)" }}>
          <span style={{ color: "var(--secondary)", fontSize: "18px" }}>📋</span>
          <span>ملف الفحوصات النشط:</span>
          <span style={{ color: "var(--primary)", fontWeight: "700" }}>{activePatient.name}</span>
        </div>
        <div>
          <span style={{ fontFamily: "Outfit", fontWeight: "700", color: "#065f46", background: "var(--accent-emerald-light)", padding: "4px 10px", borderRadius: "6px" }}>{activePatient.id}</span>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>مراجعة عاجلة</h3>
          <p style={{ color: "var(--accent-red)" }}>{testsUrgentCount}</p>
        </div>
        <div className="card">
          <h3>قيد الانتظار</h3>
          <p style={{ color: "var(--accent-amber)" }}>{testsPendingCount}</p>
        </div>
        <div className="card">
          <h3>تقارير مرفوعة</h3>
          <p style={{ color: "var(--accent-emerald)" }}>{testsCompletedCount}</p>
        </div>
      </div>

      <div className="tabs-container" style={{ marginTop: "20px" }}>
        <div className={`tab-header ${activeTestsSubTab === 'labs-tab' ? 'active' : ''}`} onClick={() => setActiveTestsSubTab('labs-tab')}>🧪 التحاليل المخبرية</div>
        <div className={`tab-header ${activeTestsSubTab === 'radiology-tab' ? 'active' : ''}`} onClick={() => setActiveTestsSubTab('radiology-tab')}>🩻 تقارير الأشعة</div>
      </div>

      {activeTestsSubTab === "labs-tab" && (
        <div id="labs-tab" className="tab-content active">
          <div className="box" style={{ boxShadow: "none", border: "none", padding: "10px 0 0", background: "transparent" }}>
            <div className="box-header">
              <h3 style={{ color: "var(--primary)", margin: "0", fontWeight: "700", fontSize: "16px" }}>طلبات ونتائج التحاليل المخبرية للمريض: {activePatient.name}</h3>
              {!isReadOnly && (
                <button className="btn" onClick={() => { 
                  setNewUpload(prev => ({ ...prev, type: "lab" }));
                  setUploadModalOpen(true);
                }}>➕ رفع نتائج جديدة</button>
              )}
            </div>
            {activePatient.reportsError ? (
              <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "15px" }}>
                <svg style={{ width: "28px", height: "28px", color: "var(--accent-red)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span style={{ fontWeight: "700" }}>فشل تحميل نتائج التحاليل المخبرية من الخادم الموحد</span>
                <button className="btn" onClick={refreshPatientData} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
              </div>
            ) : !activePatient.labs || activePatient.labs.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc", marginTop: "15px" }}>
                <svg style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto 12px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19.485 12c.504.505.748 1.157.733 1.808a4.43 4.43 0 01-1.3 3.013c-1.636 1.637-4.29 1.637-5.926 0l-5.926-5.926 5.926-5.926c1.636-1.637 4.29-1.637 5.926 0a4.43 4.43 0 011.3 3.013c.015.65-.229 1.303-.733 1.808z"></path>
                </svg>
                <span style={{ color: "#64748b", fontWeight: "600", display: "block" }}>لا توجد تحاليل مخبرية مسجلة للمريض في السجل الصحي.</span>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>اسم التحليل</th>
                      <th>التاريخ</th>
                      <th>الحالة</th>
                      <th>ملخص النتيجة</th>
                      <th>الملف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePatient.labs
                      .map((l, index) => ({ ...l, originalIndex: index }))
                      .filter(l => l.name.toLowerCase().includes(testsSearch.toLowerCase()) || (l.summary && l.summary.toLowerCase().includes(testsSearch.toLowerCase()))).length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#6b7280", padding: "25px" }}>لا توجد تحاليل مسجلة مطابقة لبحثك.</td></tr>
                    ) : (
                      activePatient.labs
                        .map((l, index) => ({ ...l, originalIndex: index }))
                        .filter(l => l.name.toLowerCase().includes(testsSearch.toLowerCase()) || (l.summary && l.summary.toLowerCase().includes(testsSearch.toLowerCase())))
                        .map((l) => (
                          <tr key={l.originalIndex}>
                            <td><b>{l.name}</b></td>
                            <td>{l.date}</td>
                            <td><span className={l.status === 'قيد الانتظار' ? 'wait' : l.status === 'مراجعة عاجلة' ? 'danger' : 'status'}>{l.status}</span></td>
                            <td><small>{l.summary || '-'}</small></td>
                            <td>
                              <button className="btn" style={{ padding: "5px 12px", fontSize: "11.5px", borderRadius: "4px" }} onClick={() => handleOpenPdf('lab', l.name, l.originalIndex)}>📄 عرض التقرير</button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTestsSubTab === "radiology-tab" && (
        <div id="radiology-tab" className="tab-content active">
          <div className="box" style={{ boxShadow: "none", border: "none", padding: "10px 0 0", background: "transparent" }}>
            <div className="box-header">
              <h3 style={{ color: "var(--primary)", margin: "0", fontWeight: "700", fontSize: "16px" }}>فحوصات وتقارير الأشعة الطبية للمريض: {activePatient.name}</h3>
              {!isReadOnly && (
                <button className="btn" onClick={() => { 
                  setNewUpload(prev => ({ ...prev, type: "radiology" }));
                  setUploadModalOpen(true);
                }}>➕ رفع تقرير أشعة جديد</button>
              )}
            </div>
            {activePatient.reportsError ? (
              <div style={{ padding: "30px", textAlign: "center", background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: "12px", color: "#991b1b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "15px" }}>
                <svg style={{ width: "28px", height: "28px", color: "var(--accent-red)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span style={{ fontWeight: "700" }}>فشل تحميل فحوصات الأشعة من الخادم الموحد</span>
                <button className="btn" onClick={refreshPatientData} style={{ background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>إعادة المحاولة</button>
              </div>
            ) : !activePatient.radiology || activePatient.radiology.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc", marginTop: "15px" }}>
                <svg style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto 12px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19.485 12c.504.505.748 1.157.733 1.808a4.43 4.43 0 01-1.3 3.013c-1.636 1.637-4.29 1.637-5.926 0l-5.926-5.926 5.926-5.926c1.636-1.637 4.29-1.637 5.926 0a4.43 4.43 0 011.3 3.013c.015.65-.229 1.303-.733 1.808z"></path>
                </svg>
                <span style={{ color: "#64748b", fontWeight: "600", display: "block" }}>لا توجد فحوصات أشعة مسجلة للمريض في السجل الصحي.</span>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>نوع الأشعة</th>
                      <th>التاريخ</th>
                      <th>الحالة</th>
                      <th>تقرير الأشعة</th>
                      <th>الملف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePatient.radiology
                      .map((r, index) => ({ ...r, originalIndex: index }))
                      .filter(r => r.name.toLowerCase().includes(testsSearch.toLowerCase()) || (r.report && r.report.toLowerCase().includes(testsSearch.toLowerCase()))).length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#6b7280", padding: "25px" }}>لا توجد فحوصات أشعة مسجلة مطابقة لبحثك.</td></tr>
                    ) : (
                      activePatient.radiology
                        .map((r, index) => ({ ...r, originalIndex: index }))
                        .filter(r => r.name.toLowerCase().includes(testsSearch.toLowerCase()) || (r.report && r.report.toLowerCase().includes(testsSearch.toLowerCase())))
                        .map((r) => (
                          <tr key={r.originalIndex}>
                            <td><b>{r.name}</b></td>
                            <td>{r.date}</td>
                            <td><span className={r.status === 'قيد الانتظار' ? 'wait' : r.status === 'مراجعة عاجلة' ? 'danger' : 'status'}>{r.status}</span></td>
                            <td><small>{r.report || '-'}</small></td>
                            <td>
                              <button className="btn" style={{ padding: "5px 12px", fontSize: "11.5px", borderRadius: "4px" }} onClick={() => handleOpenPdf('radiology', r.name, r.originalIndex)}>📄 عرض الأشعة</button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <PdfViewer 
        pdfOpen={pdfOpen} 
        pdfType={pdfType} 
        patientId={activePatient.id} 
        onClose={() => setPdfOpen(false)} 
        content={renderPdfContent()} 
        zoomLabel={true} 
        padding="45px 50px" 
      />
    </div>
  );
}

export default DoctorTestsLabs;
