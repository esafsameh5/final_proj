import React from "react";
import PdfViewer from "../common/PdfViewer";

function PatientLabs({
  patients,
  pdfOpen,
  setPdfOpen,
  pdfType,
  handleOpenPdf,
  renderPdfContent
}) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientLabsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🧪 التحاليل الطبية والمخبرية</h2>
          <p>استعرض تقارير التحاليل المرفوعة والنتائج الحيوية الموثقة</p>
        </div>
      </div>

      <div className="box">
        <h2>قائمة التحاليل المخبرية المعتمدة</h2>
        <div className="table-container" style={{ marginTop: "15px" }}>
          <table>
            <thead>
              <tr>
                <th>اسم التحليل</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>التقرير</th>
              </tr>
            </thead>
            <tbody>
              {patient.labs.map((lab, idx) => (
                <tr key={idx}>
                  <td><b>{lab.name}</b></td>
                  <td style={{ fontFamily: "Outfit" }}>{lab.date}</td>
                  <td>
                    <span className="status" style={{ background: "var(--accent-emerald-light)", color: "#065f46" }}>{lab.status}</span>
                  </td>
                  <td>
                    <button type="button" className="btn" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => handleOpenPdf('lab', lab.name, idx)}>📄 عرض التقرير PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pdfOpen && pdfType === "lab" && (
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

export default PatientLabs;
