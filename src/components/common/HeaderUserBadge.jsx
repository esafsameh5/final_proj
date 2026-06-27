import React from "react";
import { FaRegBell } from "react-icons/fa6";

function HeaderUserBadge({ name, avatar, badgeCount, hasUnread }) {
  const displayInitial = name ? name.trim().charAt(0) : "";

  // Backward compatibility: if both badgeCount and hasUnread are undefined, default count to 3
  const finalBadgeCount = (badgeCount === undefined && hasUnread === undefined) ? 3 : badgeCount;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
      {/* Notification Bell */}
      <div className="relative cursor-pointer" style={{ fontSize: "20px", color: "var(--text-muted)", position: "relative", display: "flex", alignItems: "center" }}>
        <FaRegBell />
        {finalBadgeCount > 0 ? (
          <span style={{ 
            position: "absolute", 
            top: "-5px", 
            right: "-5px", 
            background: "var(--accent-red)", 
            color: "white", 
            fontSize: "10px", 
            borderRadius: "50%", 
            width: "16px", 
            height: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontWeight: "bold",
            lineHeight: "1"
          }}>
            {finalBadgeCount}
          </span>
        ) : hasUnread ? (
          <span style={{ 
            position: "absolute", 
            top: "0px", 
            right: "0px", 
            background: "var(--accent-red)", 
            borderRadius: "50%", 
            width: "8px", 
            height: "8px",
            display: "inline-block"
          }} />
        ) : null}
      </div>

      {/* User Info & Avatar/Initial */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRight: "1px solid var(--border-color)", paddingRight: "15px" }}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              objectFit: "cover",
              border: "1.5px solid var(--border-color)",
              background: "#f1f5f9"
            }} 
          />
        ) : (
          <div style={{ 
            width: "36px", 
            height: "36px", 
            background: "var(--primary-light)", 
            color: "var(--primary)", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontWeight: "bold",
            fontSize: "15px"
          }}>
            {displayInitial}
          </div>
        )}
        <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-dark)" }}>
          {name}
        </span>
      </div>
    </div>
  );
}

export default HeaderUserBadge;
