import React from "react";

function UploadModal({
  uploadModalOpen,
  setUploadModalOpen,
  activePatient,
  newUpload,
  setNewUpload,
  submitGlobalUploadForm
}) {
  if (!uploadModalOpen || !activePatient) return null;

  return (
    <div id="uploadResultModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl", maxWidth: "600px" }}>
        <span className="close-btn" onClick={() => setUploadModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>➕ رفع نتائج تحاليل أو فحوصات جديدة للمريض النشط</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>استخدم هذا النموذج لربط التحاليل الطبية أو الأشعة الصادرة بملف المريض الموحد فور صدورها.</p>
        
        <form id="global-upload-form" onSubmit={submitGlobalUploadForm} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div>
            <label>المواطن (المريض النشط حالياً):</label>
            <input type="text" value={`${activePatient.name} (${activePatient.id})`} readOnly style={{ background: "#f1f5f9", cursor: "not-allowed", fontWeight: "bold", color: "var(--primary)", width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }} />
            <small style={{ color: "var(--accent-emerald)", display: "block", marginTop: "6px", fontWeight: "600", fontSize: "11.5px" }}>🔒 مؤمن: سيتم ربط هذا الفحص تلقائياً ببطاقة المريض المحدّد أعلاه فقط ولا يمكن تداخله.</small>
          </div>
          
          <div>
            <label>نوع الفحص الطبي:</label>
            <select value={newUpload.type} onChange={(e) => setNewUpload(prev => ({ ...prev, type: e.target.value }))} style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }}>
              <option value="lab">تحليل مخبري (Lab Test)</option>
              <option value="radiology">تقرير فحص أشعة (Radiology)</option>
            </select>
          </div>
          
          <div>
            <label>اسم الفحص الدقيق:</label>
            <input type="text" value={newUpload.name} onChange={(e) => setNewUpload(prev => ({ ...prev, name: e.target.value }))} placeholder="مثال: تحليل سكر تراكمي HbA1c، أشعة رنين مغناطيسي على الركبة..." required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }} />
          </div>
          
          <div>
            <label>ملخص النتيجة والتقرير الطبي:</label>
            <textarea value={newUpload.summary} onChange={(e) => setNewUpload(prev => ({ ...prev, summary: e.target.value }))} placeholder="اكتب ملخص النتيجة والنسب التشخيصية أو التقرير الإكلينيكي للأشعة هنا..." required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box", height: "100px", resize: "vertical" }}></textarea>
          </div>
          
          <div>
            <label>رفع ملف الفحص الداعم (PDF/ملف ممسوح ضوئياً):</label>
            <input type="file" required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "#fafbfd", boxSizing: "border-box" }} />
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", color: "white", border: "none" }}>📤 إرسال وتوثيق الفحص</button>
            <button type="button" className="btn btn-secondary" onClick={() => setUploadModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;
