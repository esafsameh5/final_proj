import React, { useState } from "react";

function MedicalReportModal({ isOpen, onClose, onSubmit, hasActiveEncounter }) {
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setFormData({ title: "", content: "" });
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!hasActiveEncounter) {
      setErrorMsg("لا يمكن إنشاء تقرير طبي قبل فتح كشف أو زيارة طبية نشطة لهذا المريض.");
      return;
    }

    if (!formData.title.trim()) {
      setErrorMsg("يرجى إدخال عنوان التقرير الطبي.");
      return;
    }

    if (!formData.content.trim()) {
      setErrorMsg("يرجى إدخال محتوى التقرير الطبي.");
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({
      title: formData.title.trim(),
      content: formData.content.trim()
    });
    setSubmitting(false);

    if (result?.success) {
      handleClose();
    } else {
      setErrorMsg(result?.message || "حدث خطأ أثناء إنشاء التقرير الطبي. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div id="medicalReportModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "620px" }}>
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>
          📝 إنشاء تقرير طبي
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "18px" }}>
          أضف تقريراً طبياً موجزاً وموثقاً مرتبطاً بالكشف الطبي النشط للمريض.
        </p>

        {!hasActiveEncounter && (
          <div style={{ padding: "12px 15px", background: "#fef3cd", color: "#856404", border: "1px solid #ffeaa7", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px", fontWeight: "bold", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
            <span>يجب فتح كشف أو زيارة طبية نشطة أولاً قبل إنشاء تقرير طبي لهذا المريض.</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "10px 15px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "var(--radius-sm)", marginBottom: "15px", fontWeight: "bold", fontSize: "14px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>
              عنوان التقرير <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="مثال: تقرير فحص إكلينيكي"
              disabled={!hasActiveEncounter || submitting}
              maxLength={250}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>
              محتوى التقرير <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="اكتب ملخص الفحص والخطة العلاجية أو الملاحظات الطبية المعتمدة..."
              disabled={!hasActiveEncounter || submitting}
              maxLength={4000}
              style={{ height: "150px", resize: "vertical", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "6px" }}>
            <button
              type="submit"
              className="btn"
              disabled={submitting || !hasActiveEncounter}
              style={{ fontWeight: "bold", padding: "12px 24px", opacity: !hasActiveEncounter ? 0.6 : 1 }}
            >
              {submitting ? "جاري الحفظ..." : "💾 حفظ التقرير الطبي"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
              style={{ fontWeight: "bold", padding: "12px 24px" }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicalReportModal;
