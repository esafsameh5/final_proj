import React from "react";

function MinistryStatCard({ label, value, suffix, icon, accent = "var(--primary)" }) {
  return (
    <div className="card">
      <h3>{label}</h3>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px" }}>
        <div>
          <p>{Number(value || 0).toLocaleString("en-US")}</p>
          {suffix ? (
            <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>{suffix}</span>
          ) : null}
        </div>
        <span
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: "rgba(37, 99, 235, 0.08)",
            color: accent,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export default MinistryStatCard;
