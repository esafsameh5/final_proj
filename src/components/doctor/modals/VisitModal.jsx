import React from "react";

function VisitModal({
  visitModalOpen,
  setVisitModalOpen,
  newVisit,
  setNewVisit,
  submitNewVisitForm
}) {
  if (!visitModalOpen) return null;

  return (
    <div id="newVisitModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={() => setVisitModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>➕ إضافة كشف طبي وتشخيص جديد</h2>
        
        <form id="new-visit-form" onSubmit={submitNewVisitForm} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div>
            <label>التشخيص الإكلينيكي:</label>
            <input 
              type="text" 
              value={newVisit.diagnosis} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, diagnosis: e.target.value }))} 
              placeholder="أدخل التشخيص الطبي للحالة..." 
              required 
            />
          </div>
          
          <div>
            <label>الأعراض الشائعة والشكوى:</label>
            <textarea 
              value={newVisit.symptoms} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, symptoms: e.target.value }))} 
              placeholder="أدخل الأعراض التي يشتكي منها المريض بالتفصيل..." 
              required 
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>
          
          <div>
            <label>العلاج والجرعة:</label>
            <input 
              type="text" 
              value={newVisit.treatment} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, treatment: e.target.value }))} 
              placeholder="العلاجات الطبية والجرعات المقررة..." 
              required 
            />
          </div>
          
          <div>
            <label>الملاحظات والتوصيات الطبية:</label>
            <textarea 
              value={newVisit.notes} 
              onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))} 
              placeholder="أدخل أي ملاحظات إضافية وتوصيات للمتابعة القادمة..." 
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ fontWeight: "bold", padding: "12px 24px" }}>💾 حفظ الكشف وتحديث الملف</button>
            <button type="button" className="btn btn-secondary" onClick={() => setVisitModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VisitModal;
