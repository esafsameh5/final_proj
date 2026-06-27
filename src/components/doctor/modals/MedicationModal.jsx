import React, { useState } from "react";

function MedicationModal({
  medicationModalOpen,
  setMedicationModalOpen,
  submitNewMedicationForm
}) {
  const [medicationName, setMedicationName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [stoppedAt, setStoppedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!medicationModalOpen) return null;

  const resetForm = () => {
    setMedicationName("");
    setDose("");
    setFrequency("");
    setStartedAt("");
    setStoppedAt("");
    setNotes("");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    setMedicationModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicationName.trim() || submitting) return;
    setSubmitting(true);
    const ok = await submitNewMedicationForm({
      medicationName: medicationName.trim(),
      dose: dose.trim() || null,
      frequency: frequency.trim() || null,
      startedAt: startedAt ? new Date(startedAt).toISOString() : null,
      stoppedAt: stoppedAt ? new Date(stoppedAt).toISOString() : null,
      isActive: true,
      visibility: 1,
      notes: notes.trim() || null
    });
    setSubmitting(false);
    if (ok) {
      resetForm();
    }
  };

  return (
    <div id="newMedicationModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "600px" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>💊 إضافة دواء حالي للمريض</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>سجل دواءً يتناوله المريض بشكل مستمر مع الجرعة وتكرار الاستخدام لتوثيقه في الملف الموحد.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label>اسم الدواء (العلمي أو التجاري):</label>
            <input
              type="text"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="مثال: أملوديبين 5 ملج..."
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
                placeholder="مثال: قرص واحد..."
                maxLength={120}
              />
            </div>
            <div>
              <label>عدد مرات الاستعمال:</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="مثال: مرة يومياً..."
                maxLength={120}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label>تاريخ بدء العلاج:</label>
              <input
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
              />
            </div>
            <div>
              <label>تاريخ إيقاف العلاج (اختياري):</label>
              <input
                type="date"
                value={stoppedAt}
                onChange={(e) => setStoppedAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>ملاحظات إكلينيكية:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات إضافية حول الدواء أو التفاعلات..."
              maxLength={1000}
              style={{ height: "70px", resize: "vertical" }}
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "⏳ جارٍ الحفظ..." : "💾 حفظ الدواء الحالي"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicationModal;
