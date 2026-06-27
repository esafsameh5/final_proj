import React from "react";
import PdfViewer from "../common/PdfViewer";
import HeaderUserBadge from "../common/HeaderUserBadge";


function PatientRadiology({
  patients,
  pdfOpen,
  setPdfOpen,
  pdfType,
  handleOpenPdf,
  renderPdfContent,
  hasUnread,
  unreadCount
}) {
  const patientId = sessionStorage.getItem("userId") || "H-2026-001";
  const patient = patients[patientId] || patients["H-2026-001"];

  return (
    <div id="patientRadiologyPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🩻 تقارير وفحوصات الأشعة</h2>
          <p>تقارير الرنين المغناطيسي والأشعة السينية والمقطعية الموثقة</p>
        </div>
        <HeaderUserBadge name={patient.name} badgeCount={unreadCount} hasUnread={hasUnread} />
      </div>

      <div className="box">
        <h2>قائمة الفحوصات التصويرية المعتمدة</h2>
        {patient.reportsError ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1.5px dashed var(--accent-red)", borderRadius: "var(--radius-lg)", background: "rgba(239, 68, 68, 0.02)", marginTop: "15px" }}>
            <span style={{ fontSize: "40px" }}>⚠️</span>
            <h3 style={{ marginTop: "12px", color: "var(--accent-red)", fontWeight: "700" }}>فشل تحميل تقارير الأشعة</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", margin: "8px 0 0 0" }}>حدث خطأ أثناء محاولة جلب تقارير الأشعة الطبية من الخادم.</p>
          </div>
        ) : !patient.radiology ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px 0", marginTop: "15px" }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ height: "50px", borderRadius: "var(--radius-sm)", background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite linear" }} />
            ))}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>
        ) : patient.radiology.length === 0 ? (
          <div style={{ padding: "50px 30px", textAlign: "center", border: "1.5px dashed var(--border-color)", borderRadius: "var(--radius-lg)", marginTop: "15px" }}>
            <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🩻</span>
            <h3 style={{ fontWeight: "700", color: "var(--text-dark)" }}>لا توجد تقارير أشعة</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "6px" }}>لم يتم توثيق أي نتائج فحوصات تصويرية أو أشعة في ملفك الطبي حالياً.</p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: "15px" }}>
            <table>
              <thead>
                <tr>
                  <th>اسم الفحص</th>
                  <th>التاريخ</th>
                  <th>المركز المصدر</th>
                  <th>التقرير</th>
                </tr>
              </thead>
              <tbody>
                {patient.radiology.map((rad, idx) => (
                  <tr key={idx}>
                    <td><b>{rad.name}</b></td>
                    <td style={{ fontFamily: "Outfit" }}>{rad.date}</td>
                    <td>وزارة الصحة - قسم الأشعة</td>
                    <td>
                      <button type="button" className="btn" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => handleOpenPdf('radiology', rad.name, idx)}>📄 عرض التقرير</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pdfOpen && pdfType === "radiology" && (
        <PdfViewer 
          pdfOpen={pdfOpen} 
          pdfType={pdfType} 
          patientId={patient.id} 
          onClose={() => setPdfOpen(false)} 
          content={renderPdfContent()} 
          padding="30px 25px" 
        />
      )}
    </div>
  );
}

export default PatientRadiology;
