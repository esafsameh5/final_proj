function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function collectTextList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (!entry || typeof entry !== "object") return "";
        return (
          asText(entry.name) ||
          asText(entry.label) ||
          asText(entry.value) ||
          asText(entry.description) ||
          asText(entry.text)
        );
      })
      .filter(Boolean);
  }

  const singleValue = asText(value);
  return singleValue ? [singleValue] : [];
}

function formatEmergencyContacts(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (!entry || typeof entry !== "object") return "";

        const contactName =
          asText(entry.contactPersonName) ||
          asText(entry.name) ||
          asText(entry.fullName);
        const number = asText(entry.number) || asText(entry.phoneNumber);

        if (contactName && number) {
          return `${contactName} - ${number}`;
        }

        return contactName || number;
      })
      .filter(Boolean);
  }

  const singleValue = asText(value);
  return singleValue ? [singleValue] : [];
}

export function mapSmartCardEmergencyData(rawPayload) {
  const payload = rawPayload && typeof rawPayload === "object" ? rawPayload : {};

  const allergyItems = collectTextList(payload.allergies);
  const chronicItems = collectTextList(
    payload.chronicCriticalConditions || payload.chronicDiseases || payload.emergencySummary
  );
  const emergencyContacts = formatEmergencyContacts(
    payload.emergencyContacts ||
      payload.phoneNumbers?.filter?.((item) => item?.isEmergencyContact)
  );

  return {
    patientId: asText(payload.patientId) || null,
    name:
      asText(payload.displayName) ||
      asText(payload.patientName) ||
      asText(payload.fullName) ||
      "بيانات الطوارئ",
    bloodType: asText(payload.bloodType) || "غير متوفر",
    allergies: allergyItems.join("، ") || "لا توجد حساسية موثقة",
    chronicDiseases: chronicItems.join("، ") || "لا توجد حالات حرجة موثقة",
    emergencyContacts,
    rawPayload: payload,
  };
}
