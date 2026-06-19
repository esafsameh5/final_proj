import React from "react";

function ReferralModal({
  referralModalOpen,
  setReferralModalOpen,
  newReferral,
  setNewReferral,
  submitReferralForm
}) {
  if (!referralModalOpen) return null;

  return (
    <div id="newReferralModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={() => setReferralModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>🏥 إنشاء تحويل طبي جديد</h2>
        
        <form id="new-referral-form" onSubmit={submitReferralForm} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div>
            <label>نوع التحويل:</label>
            <select value={newReferral.type} onChange={(e) => setNewReferral(prev => ({ ...prev, type: e.target.value }))} required>
              <option value="معمل">🧪 معمل (Laboratory)</option>
              <option value="مركز أشعة">🩻 مركز أشعة (Radiology Center)</option>
              <option value="طبيب آخر">👤 طبيب آخر (Specialist Physician)</option>
              <option value="قسم آخر داخل المستشفى">🏥 قسم آخر داخل المستشفى (Hospital Department)</option>
            </select>
          </div>
          
          <div>
            <label>الجهة المحول إليها:</label>
            <input 
              type="text" 
              value={newReferral.destination} 
              onChange={(e) => setNewReferral(prev => ({ ...prev, destination: e.target.value }))} 
              placeholder="اسم المعمل أو الطبيب أو القسم..." 
              required 
            />
          </div>
          
          <div>
            <label>سبب التحويل:</label>
            <input 
              type="text" 
              value={newReferral.reason} 
              onChange={(e) => setNewReferral(prev => ({ ...prev, reason: e.target.value }))} 
              placeholder="مثال: فحص وظائف كلى متقدم، استشارة قلبية..." 
              required 
            />
          </div>
          
          <div>
            <label>ملاحظات إضافية:</label>
            <textarea 
              value={newReferral.notes} 
              onChange={(e) => setNewReferral(prev => ({ ...prev, notes: e.target.value }))} 
              placeholder="أدخل أي ملاحظات إضافية وتفاصيل سريرية..." 
              style={{ height: "80px", resize: "vertical" }}
            ></textarea>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ fontWeight: "bold", padding: "12px 24px" }}>💾 حفظ التحويل وإصادره</button>
            <button type="button" className="btn btn-secondary" onClick={() => setReferralModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReferralModal;
