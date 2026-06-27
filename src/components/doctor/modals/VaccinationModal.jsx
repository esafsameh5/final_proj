import React, { useState } from "react";

function VaccinationModal({
  vaccinationModalOpen,
  setVaccinationModalOpen,
  submitNewVaccinationForm
}) {
  const [vaccineName, setVaccineName] = useState("");
  const [dose, setDose] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!vaccinationModalOpen) return null;

  const resetForm = () => {
    setVaccineName("");
    setDose("");
    setTakenAt("");
    setFacilityName("");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    setVaccinationModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vaccineName.trim() || submitting) return;
    setSubmitting(true);
    const ok = await submitNewVaccinationForm({
      vaccineName: vaccineName.trim(),
      dose: dose.trim() || null,
      takenAt: takenAt ? new Date(takenAt).toISOString() : null,
      facilityName: facilityName.trim() || null
    });
    setSubmitting(false);
    if (ok) {
      resetForm();
    }
  };

  return (
    <div id="newVaccinationModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>💉 إضافة تطعيم جديد للمريض</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>سجل تطعيمًا تم إعطاؤه للمواطن وحدد الجرعة وتاريخ التلقي للحفاظ على سجل تطعيم محدث.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label>اسم التطعيم:</label>
            <input
              type="text"
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              placeholder="مثال: فيروس A الالتهاب الكبدي، COVID-19..."
              required
              maxLength={200}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label>الجرعة:</label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="مثال: الجرعة الأولى، تنشيطية..."
                maxLength={80}
              />
            </div>
            <div>
              <label>تاريخ التلقي:</label>
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>المنشأة الصحية المُعطية:</label>
            <input
              type="text"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="مثال: مستشفى السلام التخصصي..."
              maxLength={200}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "⏳ جارٍ الحفظ..." : "💾 حفظ التطعيم"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VaccinationModal;
