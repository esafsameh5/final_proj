import React, { useState } from "react";

function AllergyModal({
  allergyModalOpen,
  setAllergyModalOpen,
  submitNewAllergyForm
}) {
  const [name, setName] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("2");
  const [submitting, setSubmitting] = useState(false);

  if (!allergyModalOpen) return null;

  const resetForm = () => {
    setName("");
    setReaction("");
    setSeverity("2");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    setAllergyModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    const ok = await submitNewAllergyForm({
      name: name.trim(),
      reaction: reaction.trim() || null,
      severity: Number(severity),
      visibility: 1,
      isActive: true
    });
    setSubmitting(false);
    if (ok) {
      resetForm();
    }
  };

  return (
    <div id="newAllergyModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>⚠️ إضافة حساسية جديدة للمريض</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>سجل حساسية جديدة للمواطن وحدد شدتها والأعراض المرتبطة بها للتنبيه عند صرف الأدوية مستقبلاً.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label>اسم المادة المسببة للحساسية:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: بنسلين (Penicillin)..."
              required
              maxLength={200}
            />
          </div>

          <div>
            <label>الأعراض ورد الفعل التحسسي:</label>
            <textarea
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
              placeholder="مثال: طفح جلدي، صعوبة في التنفس، تورم..."
              maxLength={700}
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label>درجة الخطورة:</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ fontWeight: "bold", color: "var(--text-dark)" }}>
                <option value="1">منخفضة</option>
                <option value="2">متوسطة</option>
                <option value="3">عالية</option>
                <option value="4">حرجة</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" disabled={submitting} style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "⏳ جارٍ الحفظ..." : "💾 حفظ الحساسية"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting} style={{ fontWeight: "bold", padding: "12px 24px", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllergyModal;
