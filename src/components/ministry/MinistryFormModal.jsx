import React from "react";

function MinistryFormModal({ title, subtitle, onClose, children, width = "560px" }) {
  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-content" style={{ width, direction: "rtl", textAlign: "right" }}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <div style={{ borderBottom: "2px solid var(--bg-main)", paddingBottom: "14px", marginBottom: "18px" }}>
          <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px", fontWeight: "700" }}>{title}</h2>
          {subtitle ? (
            <p style={{ margin: "6px 0 0 0", color: "var(--text-muted)", fontSize: "13px" }}>{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export default MinistryFormModal;
