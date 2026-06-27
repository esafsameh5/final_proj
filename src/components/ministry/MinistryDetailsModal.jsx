import React from "react";
import MinistryFormModal from "./MinistryFormModal";

function MinistryDetailsModal({ title, lines, onClose }) {
  return (
    <MinistryFormModal title={title} subtitle="عرض سريع للتفاصيل الحالية" onClose={onClose} width="520px">
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "#f8fafc",
              color: "var(--text-dark)",
              fontSize: "13px",
              lineHeight: "1.7",
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "20px" }}>
        <button type="button" className="btn" onClick={onClose}>تم</button>
      </div>
    </MinistryFormModal>
  );
}

export default MinistryDetailsModal;
