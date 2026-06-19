import { useState } from "react";
import "./PasswordInput.css";

const passwordRules = [
  { label: "على الأقل 8 أحرف", test: (p) => p.length >= 8 },
  { label: "حرف كبير (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "حرف صغير (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "رقم (0-9)", test: (p) => /\d/.test(p) },
];

export default function PasswordInput({
  value,
  onChange,
  name = "password",
  placeholder = "أدخل كلمة المرور",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const results = passwordRules.map((r) => ({
    ...r,
    isValid: r.test(value || ""),
  }));

  return (
    <div className="password-input-container">
      
      <div className={`password-field ${isFocused ? "focused" : ""}`}>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="password-input"
        />

        <button
          type="button"
          className="toggle-password-btn"
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? (
            <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
  <circle cx="12" cy="12" r="3" />
</svg>
          ) : (
           <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M3 3l18 18" />
  <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-1.42" />
  <path d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 11 7 11 7a13.16 13.16 0 01-2.17 3.19M6.53 6.53A13.16 13.16 0 001 12s4 7 11 7a10.94 10.94 0 004.47-.91" />
</svg>
          )}
        </button>
      </div>

      {isFocused && (
        <div className="hint-box">
          {results.map((rule, i) => (
            <div key={i} className="hint-row">
              <span className="hint-text">{rule.label}</span>
              <span className={`hint-icon ${rule.isValid ? "valid" : "idle"}`}>
                {rule.isValid ? "✓" : "•"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
