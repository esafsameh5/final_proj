import React, { useState } from "react";

function SurgeryHistoryModal({
  surgeryModalOpen,
  setSurgeryModalOpen,
  submitNewSurgeryForm
}) {
  const [surgeryName, setSurgeryName] = useState("");
  const [performedAt, setPerformedAt] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!surgeryModalOpen) return null;

  const resetForm = () => {
    setSurgeryName("");
    setPerformedAt("");
    setHospitalName("");
    setNotes("");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    setSurgeryModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!surgeryName.trim() || submitting) return;
    setSubmitting(true);
    const ok = await submitNewSurgeryForm({
      surgeryName: surgeryName.trim(),
      performedAt: performedAt ? new Date(performedAt).toISOString() : null,
      hospitalName: hospitalName.trim() || null,
      notes: notes.trim() || null,
      visibility: 1
    });
    setSubmitting(false);
    if (ok) {
      resetForm();
    }
  };

  return (
    <div id="newSurgeryModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>✂️ إضافة عملية جراحية للسجل</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>سجل عملية جراحية سابقة أجراها المواطن مع تفاصيل المنشأة الصحية والتقرير الإكلينيكي.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label>اسم العملية الجراحية:</label>
            <input
              type="text"
              value={surgeryName}
              onChange={(e) => setSurgeryName(e.target.value)}
              placeholder="مثال: استئصال المرارة بالمنظار..."
              required
              maxLength={250}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label>تاريخ العملية:</label>
              <input
                type="date"
                value={performedAt}
                onChange={(e) => setPerformedAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>اسم المستشفى أو المنشأة الجراحية:</label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="مثال: مستشفى دار الفؤاد التخصصي..."
              maxLength={200}
            />
          </div>

          <div>
            <label>ملاحظات إكلينيكية:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تفاصيل العملية والمضاعفات أو فترة التعافي..."
              maxLength={1500}
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "⏳ جارٍ الحفظ..." : "💾 حفظ العملية الجراحية"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurgeryHistoryModal;
