import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";


function PatientPrescriptions({ patients }) {
  const patient = patients["H-2026-001"];

  return (
    <div id="patientPrescriptionsPage" className="page-content active">
      <div className="topbar">
        <div>
          <h2>💊 الوصفات الطبية الحالية والنشطة</h2>
          <p>جدول العلاج الدوائي المعتمد من الأطباء المعالجين</p>
        </div>
        <HeaderUserBadge name={patient.name} />
      </div>

      <div className="box">
        <h2>جدول الأدوية والجرعات المعتمدة</h2>
        <div className="table-container" style={{ marginTop: "15px" }}>
          <table>
            <thead>
              <tr>
                <th>اسم الدواء العلمي والتجاري</th>
                <th>الجرعة اليومية</th>
                <th>مدة العلاج</th>
                <th>تاريخ الوصفة</th>
              </tr>
            </thead>
            <tbody>
              {patient.prescriptions.map((pr, idx) => (
                <tr key={idx}>
                  <td><b style={{ color: "var(--primary)" }}>{pr.name}</b></td>
                  <td>{pr.dosage}</td>
                  <td>{pr.duration}</td>
                  <td style={{ fontFamily: "Outfit" }}>{pr.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PatientPrescriptions;
