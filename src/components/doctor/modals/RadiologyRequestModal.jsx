import React, { useState } from "react";

function RadiologyRequestModal({ isOpen, onClose, onSubmit, hasActiveEncounter }) {
  const [formData, setFormData] = useState({ studyName: "", bodyPart: "", notes: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({ studyName: "", bodyPart: "", notes: "" });
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!hasActiveEncounter) {
      setErrorMsg("لا يوجد كشف طبي نشط للمريض. يرجى فتح زيارة طبية اولا قبل طلب الاشعة.");
      return;
    }

    if (!formData.studyName.trim()) {
      setErrorMsg("يرجى ادخال نوع الاشعة المطلوبة.");
      return;
    }

    setSubmitting(true);
    const res = await onSubmit({
      studyName: formData.studyName.trim(),
      bodyPart: formData.bodyPart.trim() || "General",
      notes: formData.notes.trim()
    });
    setSubmitting(false);

    if (res && res.success) {
      handleClose();
    } else {
      setErrorMsg(res?.message || "حدث خطا اثناء ارسال طلب الاشعة. يرجى المحاولة مرة اخرى.");
    }
  };

  return (
    <div id="radiologyRequestModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "520px" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>
          🩻 طلب اشعة جديدة
        </h2>

        {!hasActiveEncounter && (
          <div style={{ padding: "12px 15px", background: "#fef3cd", color: "#856404", border: "1px solid #ffeaa7", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px", fontWeight: "bold", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
            <span>لا يوجد كشف طبي نشط لهذا المريض. يجب فتح زيارة طبية اولا قبل امكانية طلب الاشعة.</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span>⚠️</span> <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>
              نوع الاشعة المطلوبة <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.studyName}
              onChange={(e) => setFormData(prev => ({ ...prev, studyName: e.target.value }))}
              placeholder="مثال: Chest X-Ray، CT Scan، MRI Brain..."
              disabled={!hasActiveEncounter || submitting}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>منطقة الجسم (اختياري):</label>
            <input
              type="text"
              value={formData.bodyPart}
              onChange={(e) => setFormData(prev => ({ ...prev, bodyPart: e.target.value }))}
              placeholder="مثال: Chest، Abdomen، Brain، Spine..."
              disabled={!hasActiveEncounter || submitting}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>الدواعي السريرية / ملاحظات:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="مثال: الاشتباه بارتشاح رئوي، كتلة بطنية، صداع شديد..."
              disabled={!hasActiveEncounter || submitting}
              style={{ height: "80px", resize: "vertical", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "6px" }}>
            <button
              type="submit"
              className="btn"
              disabled={submitting || !hasActiveEncounter}
              style={{ fontWeight: "bold", padding: "12px 24px", opacity: !hasActiveEncounter ? 0.6 : 1 }}
            >
              {submitting ? "جاري الارسال..." : "📤 ارسال طلب الاشعة"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              الغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RadiologyRequestModal;
