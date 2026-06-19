import React from "react";

function EditDoctorModal({
  editDoctorModalOpen,
  setEditDoctorModalOpen,
  tempDoctorInfo,
  setTempDoctorInfo,
  handleAvatarChange,
  submitEditDoctorForm
}) {
  if (!editDoctorModalOpen) return null;

  return (
    <div id="editDoctorModal" className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ textAlign: "right", direction: "rtl" }}>
        <span className="close-btn" onClick={() => setEditDoctorModalOpen(false)}>&times;</span>
        <h2 style={{ color: "var(--primary)", borderBottom: "2px solid var(--bg-main)", paddingBottom: "15px", marginTop: "0", fontWeight: "700", fontSize: "18px" }}>👤 تعديل البيانات الشخصية للطبيب</h2>
        
        <form id="edit-doctor-form" onSubmit={submitEditDoctorForm} style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label>الصورة الشخصية:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img src={tempDoctorInfo.avatar} alt="Doctor Avatar Preview" style={{ width: "65px", height: "65px", borderRadius: "50%", border: "2.5px solid var(--primary)", objectFit: "cover", background: "#f1f5f9" }} />
              <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: "13px", padding: "8px 16px", margin: "0" }}>
                📁 اختر صورة جديدة
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </label>
              {tempDoctorInfo.avatar !== "/default_doctor.png" && (
                <button type="button" className="btn" style={{ background: "#ef4444", fontSize: "13px", padding: "8px 16px" }} onClick={() => setTempDoctorInfo(prev => ({ ...prev, avatar: "/default_doctor.png" }))}>🗑️ إزالة الصورة</button>
              )}
            </div>
          </div>

          <div>
            <label>الاسم الكامل:</label>
            <input type="text" value={tempDoctorInfo.name} onChange={(e) => setTempDoctorInfo(prev => ({ ...prev, name: e.target.value }))} required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }} />
          </div>
          
          <div>
            <label>التخصص الطبي المعتمد:</label>
            <input type="text" value={tempDoctorInfo.specialization} onChange={(e) => setTempDoctorInfo(prev => ({ ...prev, specialization: e.target.value }))} required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box" }} />
          </div>
          
          <div>
            <label>البريد الإلكتروني المهني:</label>
            <input type="email" value={tempDoctorInfo.email} onChange={(e) => setTempDoctorInfo(prev => ({ ...prev, email: e.target.value }))} required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box", fontFamily: "Outfit", direction: "ltr", textAlign: "right" }} />
          </div>

          <div>
            <label>رقم الهاتف المحمول:</label>
            <input type="text" value={tempDoctorInfo.phone} onChange={(e) => setTempDoctorInfo(prev => ({ ...prev, phone: e.target.value }))} required style={{ width: "100%", padding: "10px", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-sm)", boxSizing: "border-box", fontFamily: "Outfit", direction: "ltr", textAlign: "right" }} />
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "10px" }}>
            <button type="submit" className="btn" style={{ fontWeight: "bold", padding: "12px 24px" }}>💾 حفظ التعديلات</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditDoctorModalOpen(false)} style={{ fontWeight: "bold", padding: "12px 24px" }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDoctorModal;
