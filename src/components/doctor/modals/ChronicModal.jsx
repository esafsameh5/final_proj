import React from "react";

function ChronicModal({
  chronicModalOpen,
  setChronicModalOpen,
  activePatient,
  submitChronicIllnessUpdate
}) {
  if (!chronicModalOpen || !activePatient) return null;

  return (
    <div id="chronicRequestModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={() => setChronicModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>📝 طلب تحديث الحالة الطبية للمريض</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>يرجى ملء النموذج لإرسال طلب تحديث وتأكيد الشفاء من مرض مزمن أو تغيير تصنيفه لمراجعته واعتماده من قبل الإدارة الطبية.</p>
        
        <form id="chronic-request-form" onSubmit={submitChronicIllnessUpdate} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label>الحالة المرضية الحالية المسجلة:</label>
            <input type="text" readOnly value={activePatient.chronicDiseases || "لا توجد أمراض مزمنة مسجلة"} style={{ background: "#f1f5f9", cursor: "not-allowed", fontWeight: "bold", color: "var(--primary)" }} />
          </div>
          
          <div>
            <label>المرض أو التصنيف المراد تحديثه:</label>
            <select id="cr-illness-to-update" style={{ fontWeight: "bold", color: "var(--text-dark)" }}>
              <option value="سكري من النوع الثاني">سكري من النوع الثاني</option>
              <option value="ضغط دم مرتفع">ضغط دم مرتفع</option>
              <option value="ربو شعبي">ربو شعبي</option>
              <option value="أخرى">أخرى (أدخل التفاصيل بالملاحظات)</option>
            </select>
          </div>

          <div>
            <label>الحالة المقترحة الجديدة:</label>
            <select id="cr-new-status" style={{ fontWeight: "bold", color: "var(--text-dark)" }}>
              <option value="تعافي تام (Cured)">تعافي تام (Cured) - المريض شفي تماماً</option>
              <option value="خامل / تحت السيطرة (Controlled)">خامل / تحت السيطرة (Controlled)</option>
              <option value="تغيير تصنيف الحالة (Reclassified)">تغيير تصنيف الحالة (Reclassified)</option>
            </select>
          </div>
          
          <div>
            <label>مبررات الطلب والتقرير الإكلينيكي:</label>
            <textarea id="cr-notes" placeholder="اكتب التشخيص الإكلينيكي الجديد ومبررات الشفاء أو التحديث بالتفصيل..." required style={{ height: "90px", resize: "vertical" }}></textarea>
          </div>
          
          <div>
            <label>رفع تقرير طبي أو تحليل داعم للطلب (PDF):</label>
            <input type="file" accept=".pdf" required style={{ width: "100%", padding: "8px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "#fafbfd" }} />
            <small style={{ color: "var(--text-muted)", display: "block", marginTop: "3px" }}>* تطلب الإدارة الطبية إرفاق تقارير تثبت صحة الطلب للموافقة عليه.</small>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ background: "var(--accent-emerald)", fontWeight: "bold", padding: "12px 24px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}>📩 إرسال الطلب للإدارة</button>
            <button type="button" className="btn btn-secondary" onClick={() => setChronicModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChronicModal;
