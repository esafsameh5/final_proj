import React from "react";
import PdfViewer from "../common/PdfViewer";

function PatientRadiology({
  patients,
  pdfOpen,
  setPdfOpen,
  pdfType,
  handleOpenPdf,
  renderPdfContent
}) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientRadiologyPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>🩻 تقارير وفحوصات الأشعة</h2>
          <p>تقارير الرنين المغناطيسي والأشعة السينية والمقطعية الموثقة</p>
        </div>
      </div>

      <div className="box">
        <h2>قائمة الفحوصات التصويرية المعتمدة</h2>
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
