import api from "../utils/api";

const LARGE_PAGE_SIZE = 500;

const FACILITY_REPORT_TYPES = [
  { key: "performance", title: "تقرير أداء المنشأة" },
  { key: "occupancy", title: "تقرير الإشغال" },
  { key: "departments", title: "تقرير الأقسام" },
  { key: "operations", title: "تقرير العمليات والمتابعات" },
  { key: "patients", title: "تقرير المرضى" },
];

const FIELD_LABELS = {
  id: "المعرف",
  userId: "معرف المستخدم",
  healthFacilityId: "معرف المنشأة",
  medicalDepartmentId: "معرف القسم",
  targetUserId: "المستخدم المستهدف",
  name: "الاسم",
  title: "العنوان",
  body: "المحتوى",
  message: "الرسالة",
  code: "الكود",
  email: "البريد الإلكتروني",
  phone: "الهاتف",
  status: "الحالة",
  type: "النوع",
  priority: "الأولوية",
  channel: "القناة",
  createdAt: "تاريخ الإنشاء",
  updatedAt: "تاريخ التحديث",
  scheduledAt: "موعد الإرسال",
  reviewerNotes: "ملاحظات المراجعة",
  resolution: "القرار",
  actorUserId: "المستخدم المنفذ",
  fullName: "الاسم الكامل",
  nationalNumber: "الرقم القومي",
  username: "اسم المستخدم",
  gender: "النوع",
  dateOfBirth: "تاريخ الميلاد",
  mainHealthFacilityId: "المنشأة الرئيسية",
  reason: "السبب",
  permission: "الصلاحية",
  role: "الدور",
  roleToAdd: "الدور المضاف",
  roleToRemove: "الدور المسحوب",
  approved: "الاعتماد",
  count: "العدد",
  totalCount: "إجمالي العدد",
  isActive: "نشط",
  isRead: "مقروء",
};

function toData(response) {
  return response?.data?.data ?? null;
}

function toItems(response) {
  const data = toData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

function toTotalCount(response, fallback = 0) {
  const data = toData(response);

  if (typeof data?.totalCount === "number") {
    return data.totalCount;
  }

  if (Array.isArray(data)) {
    return data.length;
  }

  return fallback;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeSearch(value) {
  return normalizeText(value).toLowerCase();
}

function matchesSearch(record, searchTerm, fields) {
  if (!searchTerm) {
    return true;
  }

  const query = normalizeSearch(searchTerm);
  return fields.some((field) => normalizeSearch(record[field]).includes(query));
}

function paginate(items, page, pageSize) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 1);
  const start = (safePage - 1) * safePageSize;
  const pageItems = items.slice(start, start + safePageSize);

  return {
    items: pageItems,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safePageSize)),
  };
}

function getValue(source, path) {
  return path.split(".").reduce((current, key) => current?.[key], source);
}

function getFirstValue(source, paths, fallback = "") {
  for (const path of paths) {
    const value = getValue(source, path);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanFromValue(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    if (value === "true" || value === "1") {
      return true;
    }

    if (value === "false" || value === "0") {
      return false;
    }
  }

  return fallback;
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toISOString().slice(0, 10);
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function toDisplayLabel(value, prefix) {
  if (value === null || value === undefined || value === "") {
    return "غير محدد";
  }

  if (typeof value === "number") {
    return `${prefix} ${value}`;
  }

  return String(value);
}

function joinFullName(parts) {
  return parts.map((part) => normalizeText(part)).filter(Boolean).join(" ");
}

function getUserDisplayName(user) {
  const fullName = getFirstValue(user, ["fullName"], null);

  if (fullName && typeof fullName === "object" && !Array.isArray(fullName)) {
    const joined = joinFullName([
      fullName.firstName,
      fullName.middleName,
      fullName.lastName,
    ]);

    if (joined) {
      return joined;
    }
  }

  return getFirstValue(
    user,
    ["displayName", "fullName", "name", "username", "email"],
    "مستخدم غير مسمى"
  );
}

function getPhoneText(user) {
  const phoneNumbers = getFirstValue(user, ["phoneNumbers"], []);

  if (Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
    const firstPhone = phoneNumbers
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        return getFirstValue(entry, ["number", "phoneNumber", "phone"], "");
      })
      .find(Boolean);

    if (firstPhone) {
      return firstPhone;
    }
  }

  return getFirstValue(user, ["phone", "phoneNumber", "mobile", "contactPhone"], "-");
}

function getAddressText(addressLike) {
  if (!addressLike) {
    return "غير متوفر";
  }

  if (typeof addressLike === "string") {
    return addressLike;
  }

  const value = joinFullName([
    addressLike.country,
    addressLike.city,
    addressLike.district,
    addressLike.street,
    addressLike.buildingNumber,
    addressLike.landmark,
    addressLike.addressDescription,
  ]);

  return value || "غير متوفر";
}

function getFacilityName(item) {
  return getFirstValue(item, ["name", "healthFacilityName", "facilityName"], "منشأة صحية");
}

function mapFacility(item) {
  const id = getFirstValue(item, ["healthFacilityId", "facilityId", "id"], "");
  const rawType = getFirstValue(item, ["type", "facilityType", "healthFacilityType", "category"], "");
  const rawGovernorate = getFirstValue(item, ["governorate", "governorateId", "governorateCode"], "");
  const governorateName = getFirstValue(item, ["governorateName", "location.city", "city"], "");
  const isActive = booleanFromValue(getFirstValue(item, ["isActive"], true), true);

  return {
    id,
    name: getFacilityName(item),
    rawType,
    type: getFirstValue(item, ["typeName", "facilityTypeName"], "") || toDisplayLabel(rawType, "النوع"),
    rawGovernorate,
    governorate:
      governorateName ||
      getFirstValue(item, ["location.governorate"], "") ||
      toDisplayLabel(rawGovernorate, "المحافظة"),
    phone: getFirstValue(item, ["phone", "phoneNumber", "mobile", "contactPhone"], "-"),
    address: getAddressText(getFirstValue(item, ["location", "address"], null)),
    location: getFirstValue(item, ["location"], null),
    createdAt: formatDate(getFirstValue(item, ["createdAt", "createdOn", "establishedAt"], "")),
    createdAtLabel: formatDateTime(getFirstValue(item, ["createdAt", "createdOn", "establishedAt"], "")),
    isActive,
    statusLabel: isActive ? "نشط" : "متوقف",
    isApproved: getFirstValue(item, ["isApproved", "approved"], null),
    original: item,
  };
}

function mapDepartment(item, facilityName = "") {
  const isActive = booleanFromValue(getFirstValue(item, ["isActive"], true), true);
  const rawSpecialty = getFirstValue(item, ["specialty", "type"], "");

  return {
    id: getFirstValue(item, ["medicalDepartmentId", "departmentId", "id"], ""),
    facilityId: getFirstValue(item, ["healthFacilityId", "__facilityId"], ""),
    name: getFirstValue(item, ["name", "departmentName", "medicalDepartmentName"], "قسم طبي"),
    specialty: getFirstValue(item, ["specialtyName"], "") || toDisplayLabel(rawSpecialty, "التخصص"),
    rawSpecialty,
    hospital: getFirstValue(
      item,
      ["facilityName", "healthFacilityName", "hospitalName", "__facilityName"],
      facilityName || "غير محدد"
    ),
    headDoctor: getFirstValue(item, ["headDoctorName", "managerName", "supervisorName"], "غير محدد"),
    doctorsCount: Number(getFirstValue(item, ["doctorsCount", "doctorCount", "usersCount"], 0)) || 0,
    bedsCount: Number(getFirstValue(item, ["bedsCount", "bedCount"], 0)) || 0,
    createdAt: formatDate(getFirstValue(item, ["createdAt", "createdOn"], "")),
    createdAtLabel: formatDateTime(getFirstValue(item, ["createdAt", "createdOn"], "")),
    isActive,
    statusLabel: isActive ? "نشط" : "متوقف",
    original: item,
  };
}

function mapUser(item) {
  const id = getFirstValue(item, ["userId", "id"], "");
  const facilityId = getFirstValue(
    item,
    ["mainHealthFacilityId", "healthFacilityId", "facilityId", "organizationId"],
    ""
  );
  const isActive = booleanFromValue(getFirstValue(item, ["isActive"], true), true);
  const roles = getFirstValue(item, ["roles"], []);
  const roleLabel = Array.isArray(roles)
    ? roles.map((role) => toDisplayLabel(role, "دور")).join("، ")
    : toDisplayLabel(getFirstValue(item, ["role", "roles"], ""), "دور");

  return {
    id,
    name: getUserDisplayName(item),
    firstName: getFirstValue(item, ["fullName.firstName"], ""),
    middleName: getFirstValue(item, ["fullName.middleName"], ""),
    lastName: getFirstValue(item, ["fullName.lastName"], ""),
    nationalNumber: getFirstValue(item, ["nationalNumber"], "-"),
    username: getFirstValue(item, ["username"], "-"),
    email: getFirstValue(item, ["email"], "-"),
    phone: getPhoneText(item),
    phoneNumbers: getFirstValue(item, ["phoneNumbers"], []),
    genderValue: getFirstValue(item, ["gender"], ""),
    genderLabel: toDisplayLabel(getFirstValue(item, ["gender"], ""), "النوع"),
    dateOfBirth: formatDate(getFirstValue(item, ["dateOfBirth"], "")),
    facilityId,
    hospital: getFirstValue(
      item,
      ["mainHealthFacilityName", "facilityName", "healthFacilityName", "organizationName"],
      "غير محدد"
    ),
    department: getFirstValue(item, ["departmentName", "medicalDepartmentName"], "غير محدد"),
    specialty: getFirstValue(item, ["specialtyName", "specialty"], "غير محدد"),
    rawSpecialty: getFirstValue(item, ["specialty", "specialtyName"], ""),
    roles,
    roleLabel,
    createdAt: formatDate(getFirstValue(item, ["createdAt", "createdOn"], "")),
    createdAtLabel: formatDateTime(getFirstValue(item, ["createdAt", "createdOn"], "")),
    isActive,
    statusLabel: isActive ? "نشط" : "متوقف",
    original: item,
  };
}

function mapCatalogEntry(item) {
  const id = getFirstValue(item, ["icd10CodeId", "medicationCatalogId", "id"], "");

  return {
    id,
    code: getFirstValue(item, ["code"], "-"),
    nameAr: getFirstValue(item, ["nameAr", "tradeName"], "-"),
    nameEn: getFirstValue(item, ["nameEn", "scientificName"], "-"),
    description: getFirstValue(item, ["description", "strength"], "-"),
    original: item,
  };
}

function mapNotification(item) {
  const id = getFirstValue(item, ["notificationId", "id"], "");
  const isRead = booleanFromValue(getFirstValue(item, ["isRead", "read"], false), false);

  return {
    id,
    title: getFirstValue(item, ["title"], "إشعار"),
    body: getFirstValue(item, ["body", "message"], ""),
    priority: toDisplayLabel(getFirstValue(item, ["priority"], ""), "أولوية"),
    channel: toDisplayLabel(getFirstValue(item, ["channel"], ""), "قناة"),
    createdAt: formatDateTime(getFirstValue(item, ["createdAt", "sentAt", "scheduledAt"], "")),
    isRead,
    statusLabel: isRead ? "مقروء" : "غير مقروء",
    original: item,
  };
}

function mapDispute(item) {
  return {
    id: getFirstValue(item, ["disputeId", "id"], ""),
    targetType: getFirstValue(item, ["targetType"], "-"),
    targetId: getFirstValue(item, ["targetId"], "-"),
    status: toDisplayLabel(getFirstValue(item, ["status"], ""), "الحالة"),
    reason: getFirstValue(item, ["reason"], "-"),
    resolution: getFirstValue(item, ["resolution"], "-"),
    createdAt: formatDateTime(getFirstValue(item, ["createdAt"], "")),
    original: item,
  };
}

function mapAuditLog(item) {
  return {
    id: getFirstValue(item, ["auditLogId", "id"], ""),
    actor: getFirstValue(item, ["actorUserName", "actorName", "actorUserId"], "-"),
    action: getFirstValue(item, ["action", "eventType", "operation"], "-"),
    entity: getFirstValue(item, ["entityType", "targetType"], "-"),
    details: getFirstValue(item, ["details", "description", "message"], "-"),
    createdAt: formatDateTime(getFirstValue(item, ["createdAt", "timestamp"], "")),
    original: item,
  };
}

function uniqueOptions(items, getValueKey, getLabelKey) {
  return items.reduce((result, item) => {
    const value = item[getValueKey];
    const label = item[getLabelKey];

    if (value === undefined || value === null || value === "" || !label) {
      return result;
    }

    if (!result.some((entry) => entry.value === value)) {
      result.push({ value, label });
    }

    return result;
  }, []);
}

function countByKey(items, getKey) {
  return items.reduce((accumulator, item) => {
    const key = getKey(item);
    if (!key) {
      return accumulator;
    }

    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function getMonthKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getRecentMonthKeys(count = 6) {
  const base = new Date();
  const keys = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(base.getFullYear(), base.getMonth() - offset, 1);
    keys.push(getMonthKey(date));
  }

  return keys;
}

function getArabicMonthLabel(monthKey) {
  const date = new Date(`${monthKey}-01T00:00:00`);
  return new Intl.DateTimeFormat("ar-EG", { month: "long" }).format(date);
}

function buildLocationPayload(formState) {
  const location = {
    locationType: numberOrNull(formState.locationType),
    country: normalizeText(formState.country),
    governorate: numberOrNull(formState.governorate),
    region: numberOrNull(formState.region),
    city: normalizeText(formState.city),
    district: normalizeText(formState.district),
    street: normalizeText(formState.street),
    buildingNumber: normalizeText(formState.buildingNumber),
    floor: normalizeText(formState.floor),
    apartmentNumber: normalizeText(formState.apartmentNumber),
    landmark: normalizeText(formState.landmark),
    addressDescription: normalizeText(formState.addressDescription),
  };

  const hasValue = Object.values(location).some((value) => value !== null && value !== "");
  return hasValue ? location : null;
}

function buildFacilityPayload(formState, includeStatus = false) {
  const payload = {
    name: normalizeText(formState.name),
    type: numberOrNull(formState.type),
    governorate: numberOrNull(formState.governorate),
    location: buildLocationPayload(formState),
    phone: normalizeText(formState.phone),
  };

  if (includeStatus) {
    payload.isActive = booleanFromValue(formState.isActive, true);
  }

  return payload;
}

function buildUserCreatePayload(formState) {
  return {
    fullName: {
      firstName: normalizeText(formState.firstName),
      middleName: normalizeText(formState.middleName),
      lastName: normalizeText(formState.lastName),
    },
    nationalNumber: normalizeText(formState.nationalNumber),
    username: normalizeText(formState.username),
    email: normalizeText(formState.email),
    password: normalizeText(formState.password),
    roles: numberOrNull(formState.roleNumber),
    gender: numberOrNull(formState.gender),
    dateOfBirth: normalizeText(formState.dateOfBirth)
      ? new Date(`${formState.dateOfBirth}T00:00:00Z`).toISOString()
      : null,
    mainHealthFacilityId: normalizeText(formState.mainHealthFacilityId) || null,
    address: null,
    phoneNumbers: [],
  };
}

function buildUserUpdatePayload(formState) {
  return {
    fullName: {
      firstName: normalizeText(formState.firstName),
      middleName: normalizeText(formState.middleName),
      lastName: normalizeText(formState.lastName),
    },
    email: normalizeText(formState.email),
    gender: numberOrNull(formState.gender),
    dateOfBirth: normalizeText(formState.dateOfBirth)
      ? new Date(`${formState.dateOfBirth}T00:00:00Z`).toISOString()
      : null,
    mainHealthFacilityId: normalizeText(formState.mainHealthFacilityId) || null,
    address: null,
  };
}

function buildReadableKey(key) {
  return (
    FIELD_LABELS[key] ||
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replaceAll("_", " ")
      .trim()
  );
}

export function buildDisplayLines(value, prefix = "") {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (typeof value !== "object") {
    return [prefix ? `${prefix}: ${value}` : String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      buildDisplayLines(entry, prefix ? `${prefix} ${index + 1}` : `عنصر ${index + 1}`)
    );
  }

  return Object.entries(value).flatMap(([key, entry]) => {
    const label = prefix ? `${prefix} - ${buildReadableKey(key)}` : buildReadableKey(key);

    if (entry === null || entry === undefined || entry === "") {
      return [];
    }

    if (typeof entry === "object") {
      return buildDisplayLines(entry, label);
    }

    return `${label}: ${entry}`;
  });
}

async function fetchFacilitiesRaw({
  search = "",
  page = 1,
  pageSize = LARGE_PAGE_SIZE,
  includeInactive = true,
} = {}) {
  const response = await api.get("/api/v1/facilities", {
    params: {
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive,
    },
  });

  return toItems(response);
}

async function fetchUsersRaw({
  role = "",
  search = "",
  page = 1,
  pageSize = LARGE_PAGE_SIZE,
  includeInactive = true,
} = {}) {
  const response = await api.get("/api/v1/users", {
    params: {
      role: normalizeText(role) || undefined,
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive,
    },
  });

  return toItems(response);
}

async function fetchFacilityDepartmentsRaw(facilityId, {
  search = "",
  page = 1,
  pageSize = LARGE_PAGE_SIZE,
  includeInactive = true,
} = {}) {
  const response = await api.get(`/api/v1/facilities/${facilityId}/departments`, {
    params: {
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive,
    },
  });

  return toItems(response);
}

async function fetchAllDepartmentsRaw() {
  const facilities = await fetchFacilitiesRaw();

  const settled = await Promise.allSettled(
    facilities.map(async (facility) => {
      const mappedFacility = mapFacility(facility);
      if (!mappedFacility.id) {
        return [];
      }

      const departments = await fetchFacilityDepartmentsRaw(mappedFacility.id);
      return departments.map((department) => ({
        ...department,
        __facilityId: mappedFacility.id,
        __facilityName: mappedFacility.name,
      }));
    })
  );

  return settled.flatMap((entry) => (entry.status === "fulfilled" ? entry.value : []));
}

export function getApiErrorInfo(error, fallbackMessage = "") {
  const responseStatus = error?.response?.status || null;
  const backendMessage = normalizeText(error?.response?.data?.message);
  const errorCode = normalizeText(error?.code).toUpperCase();
  const errorMessage = normalizeText(error?.message);
  const timedOut =
    errorCode === "ECONNABORTED" ||
    errorCode === "ETIMEDOUT" ||
    errorMessage.toLowerCase().includes("timeout");

  if (timedOut) {
    return {
      status: null,
      type: "timeout",
      message:
        backendMessage ||
        "استغرق الخادم وقتًا أطول من المتوقع. يرجى إعادة المحاولة بعد قليل.",
    };
  }

  if (!error?.response) {
    return {
      status: null,
      type: "network",
      message:
        backendMessage ||
        "تعذر الاتصال بالخادم. يرجى التحقق من الشبكة ثم إعادة المحاولة.",
    };
  }

  const statusMessages = {
    401: "انتهت صلاحية الجلسة أو تعذر التحقق من الهوية. يرجى تسجيل الدخول مرة أخرى.",
    403: "ليست لديك صلاحية للوصول إلى هذه البيانات.",
    404: "تعذر العثور على المورد المطلوب على الخادم.",
  };

  if (responseStatus >= 500) {
    return {
      status: responseStatus,
      type: "server",
      message: backendMessage || "حدث خطأ داخلي في الخادم أثناء تنفيذ الطلب.",
    };
  }

  return {
    status: responseStatus,
    type: "http",
    message: backendMessage || statusMessages[responseStatus] || fallbackMessage || "تعذر إكمال الطلب.",
  };
}

export function formatApiError(error, fallbackMessage) {
  return getApiErrorInfo(error, fallbackMessage).message;
}

export async function fetchMinistryHospitals({
  page = 1,
  pageSize = 10,
  search = "",
  status = "all",
  type = "all",
  governorate = "all",
} = {}) {
  const facilities = await fetchFacilitiesRaw({ search });
  const mapped = facilities.map(mapFacility);

  const filtered = mapped.filter((facility) => {
    const statusMatch =
      status === "all" ||
      (status === "active" ? facility.isActive : !facility.isActive);
    const typeMatch = type === "all" || String(facility.rawType) === String(type);
    const governorateMatch =
      governorate === "all" ||
      String(facility.rawGovernorate) === String(governorate) ||
      facility.governorate === governorate;

    return statusMatch && typeMatch && governorateMatch && matchesSearch(facility, search, [
      "name",
      "type",
      "governorate",
      "phone",
      "address",
    ]);
  });

  const sorted = filtered.sort((first, second) => first.name.localeCompare(second.name, "ar"));
  const pagination = paginate(sorted, page, pageSize);

  return {
    ...pagination,
    summary: {
      activeCount: sorted.filter((item) => item.isActive).length,
      inactiveCount: sorted.filter((item) => !item.isActive).length,
      types: uniqueOptions(mapped, "rawType", "type"),
      governorates: uniqueOptions(mapped, "rawGovernorate", "governorate"),
    },
  };
}

export async function fetchMinistryDoctors({
  page = 1,
  pageSize = 10,
  search = "",
  status = "all",
  specialty = "all",
  hospital = "all",
} = {}) {
  const doctors = await fetchUsersRaw({ role: "Doctor", search });
  const mapped = doctors.map(mapUser);

  const filtered = mapped.filter((doctor) => {
    const statusMatch =
      status === "all" ||
      (status === "active" ? doctor.isActive : !doctor.isActive);
    const specialtyMatch =
      specialty === "all" || String(doctor.rawSpecialty) === String(specialty);
    const hospitalMatch = hospital === "all" || doctor.hospital === hospital;

    return statusMatch && specialtyMatch && hospitalMatch && matchesSearch(doctor, search, [
      "name",
      "email",
      "phone",
      "hospital",
      "department",
      "username",
      "nationalNumber",
    ]);
  });

  const sorted = filtered.sort((first, second) => first.name.localeCompare(second.name, "ar"));
  const pagination = paginate(sorted, page, pageSize);

  return {
    ...pagination,
    summary: {
      activeCount: sorted.filter((item) => item.isActive).length,
      inactiveCount: sorted.filter((item) => !item.isActive).length,
      hospitals: [...new Set(mapped.map((item) => item.hospital).filter(Boolean))],
      specialties: uniqueOptions(
        mapped.map((item) => ({ rawSpecialty: item.rawSpecialty, specialty: item.specialty })),
        "rawSpecialty",
        "specialty"
      ),
    },
  };
}

export async function fetchMinistryDepartments({
  page = 1,
  pageSize = 10,
  search = "",
  status = "all",
  facilityId = "all",
  specialty = "all",
} = {}) {
  const departments = (await fetchAllDepartmentsRaw()).map((department) =>
    mapDepartment(department, department.__facilityName)
  );

  const filtered = departments.filter((department) => {
    const statusMatch =
      status === "all" ||
      (status === "active" ? department.isActive : !department.isActive);
    const facilityMatch = facilityId === "all" || department.facilityId === facilityId;
    const specialtyMatch =
      specialty === "all" || String(department.rawSpecialty) === String(specialty);

    return statusMatch && facilityMatch && specialtyMatch && matchesSearch(department, search, [
      "name",
      "hospital",
      "specialty",
      "headDoctor",
    ]);
  });

  const sorted = filtered.sort((first, second) => first.name.localeCompare(second.name, "ar"));
  const pagination = paginate(sorted, page, pageSize);

  return {
    ...pagination,
    summary: {
      activeCount: sorted.filter((item) => item.isActive).length,
      inactiveCount: sorted.filter((item) => !item.isActive).length,
      facilityOptions: uniqueOptions(sorted, "facilityId", "hospital"),
      specialties: uniqueOptions(
        sorted.map((item) => ({ rawSpecialty: item.rawSpecialty, specialty: item.specialty })),
        "rawSpecialty",
        "specialty"
      ),
      totalDoctors: sorted.reduce((sum, item) => sum + Number(item.doctorsCount || 0), 0),
      totalBeds: sorted.reduce((sum, item) => sum + Number(item.bedsCount || 0), 0),
    },
  };
}

export async function fetchMinistryDashboardData() {
  const [statsResponse, hospitalsData, doctorsData, departmentsData] = await Promise.allSettled([
    api.get("/api/v1/ministry/stats"),
    fetchMinistryHospitals({ page: 1, pageSize: LARGE_PAGE_SIZE }),
    fetchMinistryDoctors({ page: 1, pageSize: LARGE_PAGE_SIZE }),
    fetchMinistryDepartments({ page: 1, pageSize: LARGE_PAGE_SIZE }),
  ]);

  if (statsResponse.status !== "fulfilled") {
    throw statsResponse.reason;
  }

  const stats = toData(statsResponse.value) || {};
  const hospitals = hospitalsData.status === "fulfilled" ? hospitalsData.value.items : [];
  const doctors = doctorsData.status === "fulfilled" ? doctorsData.value.items : [];
  const departments = departmentsData.status === "fulfilled" ? departmentsData.value.items : [];
  const widgetErrors = {
    registrations:
      hospitalsData.status === "rejected" &&
      doctorsData.status === "rejected" &&
      departmentsData.status === "rejected"
        ? "تعذر تحميل بيانات التسجيلات المساندة من الخادم."
        : "",
    doctorsBySpecialty:
      doctorsData.status === "rejected"
        ? formatApiError(doctorsData.reason, "تعذر تحميل بيانات تخصصات الأطباء.")
        : "",
    hospitalsByType:
      hospitalsData.status === "rejected"
        ? formatApiError(hospitalsData.reason, "تعذر تحميل بيانات أنواع المنشآت.")
        : "",
  };

  const patientCount = Number(
    getFirstValue(stats, ["patientCount", "patientsCount", "totalPatients"], 0)
  ) || 0;
  const doctorCount = Number(
    getFirstValue(stats, ["doctorCount", "doctorsCount", "totalDoctors"], doctors.length)
  ) || doctors.length;
  const facilityCount = Number(
    getFirstValue(stats, ["facilityCount", "facilitiesCount", "totalFacilities"], hospitals.length)
  ) || hospitals.length;
  const departmentCount = Number(
    getFirstValue(stats, ["departmentCount", "departmentsCount", "totalDepartments"], departments.length)
  ) || departments.length;

  const registrationDates = [
    ...hospitals.map((item) => item.createdAt),
    ...doctors.map((item) => item.createdAt),
    ...departments.map((item) => item.createdAt),
  ].filter((value) => value && value !== "-");

  const recentMonthKeys = getRecentMonthKeys();
  const registrationCounts = countByKey(registrationDates, (value) => getMonthKey(value));
  const registrations = recentMonthKeys.map((monthKey) => ({
    key: monthKey,
    label: getArabicMonthLabel(monthKey),
    value: registrationCounts[monthKey] || 0,
  }));

  const doctorsBySpecialty = Object.entries(countByKey(doctors, (item) => item.specialty))
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 5);

  const hospitalsByType = Object.entries(countByKey(hospitals, (item) => item.type))
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value);

  return {
    cards: [
      { id: "patients", label: "إجمالي المرضى", value: patientCount, suffix: "مريض" },
      { id: "doctors", label: "إجمالي الأطباء", value: doctorCount, suffix: "طبيب" },
      { id: "hospitals", label: "إجمالي المنشآت", value: facilityCount, suffix: "منشأة" },
      { id: "departments", label: "إجمالي الأقسام", value: departmentCount, suffix: "قسم" },
    ],
    registrations,
    doctorsBySpecialty,
    hospitalsByType,
    statsLines: buildDisplayLines(stats).slice(0, 8),
    widgetErrors,
  };
}

export async function fetchMinistryNotifications() {
  const response = await api.get("/api/v1/notifications/my");
  return toItems(response).map(mapNotification);
}

export async function markMinistryNotificationAsRead(id) {
  return api.patch(`/api/v1/notifications/${id}/read`);
}

export async function generatePatientSmartCard({ patientId, type }) {
  return api.post("/api/v1/auth/smart-card/generate", null, {
    params: {
      patientId: normalizeText(patientId),
      type: normalizeText(type),
    },
  });
}

export async function redeemSmartCardToken(token) {
  const response = await api.get("/api/v1/auth/smart-card/redeem", {
    params: { token: normalizeText(token) },
  });

  return toData(response);
}

export async function createMinistryHospital(payload) {
  return api.post("/api/v1/facilities", buildFacilityPayload(payload, false));
}

export async function updateMinistryHospital(id, payload) {
  return api.put(`/api/v1/facilities/${id}`, buildFacilityPayload(payload, true));
}

export async function approveMinistryHospital(id, payload) {
  return api.put(`/api/v1/ministry/facilities/${id}/approve`, {
    approved: booleanFromValue(payload.approved, true),
    reviewerNotes: normalizeText(payload.reviewerNotes),
  });
}

export async function suspendMinistryHospital(id, reason) {
  return api.put(`/api/v1/ministry/facilities/${id}/suspend`, null, {
    params: { reason: normalizeText(reason) },
  });
}

export async function fetchMinistryFacilitySnapshot(facilityId) {
  const [analyticsResponse, admissionsResponse, roomsResponse, bedsResponse, operationsResponse, departmentsResponse] =
    await Promise.allSettled([
      api.get(`/api/v1/facilities/${facilityId}/analytics`),
      api.get(`/api/v1/facilities/${facilityId}/admissions`, {
        params: { page: 1, pageSize: 5, includeInactive: true },
      }),
      api.get(`/api/v1/facilities/${facilityId}/rooms`),
      api.get(`/api/v1/facilities/${facilityId}/beds`, {
        params: { page: 1, pageSize: 5, includeInactive: true },
      }),
      api.get(`/api/v1/facilities/${facilityId}/operations`, {
        params: { page: 1, pageSize: 5, includeInactive: true },
      }),
      api.get(`/api/v1/facilities/${facilityId}/departments`, {
        params: { page: 1, pageSize: 5, includeInactive: true },
      }),
    ]);

  return {
    analytics: analyticsResponse.status === "fulfilled" ? toData(analyticsResponse.value) || {} : {},
    admissions: admissionsResponse.status === "fulfilled" ? toItems(admissionsResponse.value) : [],
    rooms: roomsResponse.status === "fulfilled" ? toItems(roomsResponse.value) : [],
    beds: bedsResponse.status === "fulfilled" ? toItems(bedsResponse.value) : [],
    operations: operationsResponse.status === "fulfilled" ? toItems(operationsResponse.value) : [],
    departments: departmentsResponse.status === "fulfilled" ? toItems(departmentsResponse.value) : [],
    errors: {
      analytics:
        analyticsResponse.status === "rejected"
          ? formatApiError(analyticsResponse.reason, "تعذر تحميل تحليلات المنشأة.")
          : "",
      admissions:
        admissionsResponse.status === "rejected"
          ? formatApiError(admissionsResponse.reason, "تعذر تحميل حالات الدخول.")
          : "",
      rooms:
        roomsResponse.status === "rejected"
          ? formatApiError(roomsResponse.reason, "تعذر تحميل بيانات الغرف.")
          : "",
      beds:
        bedsResponse.status === "rejected"
          ? formatApiError(bedsResponse.reason, "تعذر تحميل بيانات الأسرة.")
          : "",
      operations:
        operationsResponse.status === "rejected"
          ? formatApiError(operationsResponse.reason, "تعذر تحميل بيانات العمليات.")
          : "",
      departments:
        departmentsResponse.status === "rejected"
          ? formatApiError(departmentsResponse.reason, "تعذر تحميل بيانات الأقسام.")
          : "",
    },
  };
}

export async function fetchMinistryFacilityReports(facilityId, { from, to }) {
  const params = {
    from: normalizeText(from) || undefined,
    to: normalizeText(to) || undefined,
  };

  const requests = FACILITY_REPORT_TYPES.map((report) => {
    const supportsRange = report.key !== "occupancy";
    return api.get(`/api/v1/facilities/${facilityId}/reports/${report.key}`, {
      params: supportsRange ? params : undefined,
    });
  });

  const responses = await Promise.allSettled(requests);

  const reports = responses.flatMap((response, index) => {
    if (response.status !== "fulfilled") {
      return [];
    }

    const reportMeta = FACILITY_REPORT_TYPES[index];
    const data = toData(response.value);

    return {
      id: `${facilityId}-${reportMeta.key}`,
      typeKey: reportMeta.key,
      title: reportMeta.title,
      createdAtLabel: formatDateTime(new Date().toISOString()),
      period:
        normalizeText(from) && normalizeText(to)
          ? `${normalizeText(from)} - ${normalizeText(to)}`
          : "الفترة الحالية",
      status: "محدث",
      content: buildDisplayLines(data).slice(0, 20),
      raw: data,
    };
  });

  const errors = responses.flatMap((response, index) => {
    if (response.status !== "rejected") {
      return [];
    }

    const reportMeta = FACILITY_REPORT_TYPES[index];
    return [{
      key: reportMeta.key,
      title: reportMeta.title,
      message: formatApiError(response.reason, `تعذر تحميل ${reportMeta.title}.`),
    }];
  });

  return { reports, errors };
}

export async function fetchMinistryUserDetails(userId) {
  const response = await api.get(`/api/v1/users/${userId}`);
  return mapUser(toData(response) || {});
}

export async function createMinistryDoctor(payload) {
  return api.post("/api/v1/users", buildUserCreatePayload(payload));
}

export async function updateMinistryDoctor(id, payload) {
  return api.put(`/api/v1/users/${id}`, buildUserUpdatePayload(payload));
}

export async function updateMinistryDoctorStatus(id, isActive) {
  return api.patch(`/api/v1/users/${id}/status`, null, {
    params: { status: isActive ? 1 : 0 },
  });
}

export async function deleteMinistryDoctor(id) {
  return api.delete(`/api/v1/users/${id}`);
}

export async function fetchUserFacilityRoles(userId) {
  const response = await api.get(`/api/v1/users/${userId}/facility-roles`);
  const data = toData(response);
  return Array.isArray(data) ? data : data?.items || [];
}

export async function assignUserFacilityRole(payload) {
  return api.post("/api/v1/users/facility-roles/assign", {
    targetUserId: normalizeText(payload.targetUserId),
    healthFacilityId: normalizeText(payload.healthFacilityId),
    role: numberOrNull(payload.role),
    medicalDepartmentId: normalizeText(payload.medicalDepartmentId) || null,
  });
}

export async function suspendUserFacilityRole(payload) {
  return api.post("/api/v1/users/facility-roles/suspend", {
    targetUserId: normalizeText(payload.targetUserId),
    healthFacilityId: normalizeText(payload.healthFacilityId),
    role: numberOrNull(payload.role),
    reason: normalizeText(payload.reason),
  });
}

export async function reinstateUserFacilityRole(payload) {
  return api.post("/api/v1/users/facility-roles/reinstate", {
    targetUserId: normalizeText(payload.targetUserId),
    healthFacilityId: normalizeText(payload.healthFacilityId),
    role: numberOrNull(payload.role),
  });
}

export async function terminateUserFacilityRole(payload) {
  return api.post("/api/v1/users/facility-roles/terminate", {
    targetUserId: normalizeText(payload.targetUserId),
    healthFacilityId: normalizeText(payload.healthFacilityId),
    role: numberOrNull(payload.role),
    reason: normalizeText(payload.reason),
  });
}

export async function assignGlobalRole(payload) {
  return api.post("/api/v1/users/global-roles/assign", {
    targetUserId: normalizeText(payload.targetUserId),
    roleToAdd: numberOrNull(payload.roleToAdd),
  });
}

export async function revokeGlobalRole(payload) {
  return api.post("/api/v1/users/global-roles/revoke", {
    targetUserId: normalizeText(payload.targetUserId),
    roleToRemove: numberOrNull(payload.roleToRemove),
  });
}

export async function fetchMyPermissions() {
  const response = await api.get("/api/v1/permissions/my");
  const data = toData(response);
  return Array.isArray(data) ? data : data?.items || buildDisplayLines(data);
}

export async function grantUserPermission(payload) {
  return api.post("/api/v1/permissions/grant", {
    targetUserId: normalizeText(payload.targetUserId),
    permission: numberOrNull(payload.permission),
    healthFacilityId: normalizeText(payload.healthFacilityId) || null,
    medicalDepartmentId: normalizeText(payload.medicalDepartmentId) || null,
    expiresAt: normalizeText(payload.expiresAt)
      ? new Date(payload.expiresAt).toISOString()
      : null,
  });
}

export async function revokeUserPermission(payload) {
  return api.post("/api/v1/permissions/revoke", {
    targetUserId: normalizeText(payload.targetUserId),
    permission: numberOrNull(payload.permission),
    healthFacilityId: normalizeText(payload.healthFacilityId) || null,
    medicalDepartmentId: normalizeText(payload.medicalDepartmentId) || null,
  });
}

export async function checkUserPermission(payload) {
  const response = await api.get("/api/v1/permissions/check", {
    params: {
      userId: normalizeText(payload.userId),
      permission: numberOrNull(payload.permission),
      facilityId: normalizeText(payload.facilityId) || undefined,
      departmentId: normalizeText(payload.departmentId) || undefined,
    },
  });

  return toData(response);
}

export async function createMinistryNotification(payload) {
  return api.post("/api/v1/notifications", {
    userId: normalizeText(payload.userId),
    type: numberOrNull(payload.type),
    priority: numberOrNull(payload.priority),
    channel: numberOrNull(payload.channel),
    title: normalizeText(payload.title),
    body: normalizeText(payload.body),
    scheduledAt: normalizeText(payload.scheduledAt)
      ? new Date(payload.scheduledAt).toISOString()
      : null,
    relatedEntityType: normalizeText(payload.relatedEntityType) || null,
    relatedEntityId: normalizeText(payload.relatedEntityId) || null,
    metadataJson: normalizeText(payload.metadataJson) || "{}",
  });
}

export async function fetchIcd10Catalog({
  page = 1,
  pageSize = 8,
  search = "",
} = {}) {
  const response = await api.get("/api/v1/lookups/icd10", {
    params: {
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive: true,
    },
  });

  const items = toItems(response).map(mapCatalogEntry);

  return {
    items,
    totalCount: toTotalCount(response, items.length),
  };
}

export async function createIcd10CatalogEntry(payload) {
  return api.post("/api/v1/lookups/icd10", {
    code: normalizeText(payload.code),
    nameEn: normalizeText(payload.nameEn),
    nameAr: normalizeText(payload.nameAr),
    description: normalizeText(payload.description),
  });
}

export async function fetchMedicationCatalog({
  page = 1,
  pageSize = 8,
  search = "",
} = {}) {
  const response = await api.get("/api/v1/lookups/medications", {
    params: {
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive: true,
    },
  });

  const items = toItems(response).map(mapCatalogEntry);

  return {
    items,
    totalCount: toTotalCount(response, items.length),
  };
}

export async function createMedicationCatalogEntry(payload) {
  return api.post("/api/v1/lookups/medications", {
    tradeName: normalizeText(payload.tradeName),
    scientificName: normalizeText(payload.scientificName),
    code: normalizeText(payload.code),
    strength: normalizeText(payload.strength),
    form: numberOrNull(payload.form),
    manufacturer: normalizeText(payload.manufacturer),
    isControlled: booleanFromValue(payload.isControlled, false),
  });
}

export async function createInsuranceProvider(payload) {
  return api.post("/api/v1/insurance/providers", {
    name: normalizeText(payload.name),
    code: normalizeText(payload.code),
    phone: normalizeText(payload.phone),
  });
}

export async function fetchMinistryDisputes({
  page = 1,
  pageSize = 8,
  search = "",
  status = "",
} = {}) {
  const response = await api.get("/api/v1/ministry/disputes", {
    params: {
      status: normalizeText(status) || undefined,
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive: true,
    },
  });

  const items = toItems(response).map(mapDispute);

  return {
    items,
    totalCount: toTotalCount(response, items.length),
  };
}

export async function createMinistryDispute(payload) {
  return api.post("/api/v1/ministry/disputes", {
    targetType: normalizeText(payload.targetType),
    targetId: normalizeText(payload.targetId),
    reason: normalizeText(payload.reason),
  });
}

export async function reviewMinistryDispute(id, payload) {
  return api.patch(`/api/v1/ministry/disputes/${id}/review`, {
    status: numberOrNull(payload.status),
    resolution: normalizeText(payload.resolution),
  });
}

export async function fetchMinistryAuditLogs({
  page = 1,
  pageSize = 8,
  search = "",
  actorUserId = "",
} = {}) {
  const response = await api.get("/api/v1/audit", {
    params: {
      actorUserId: normalizeText(actorUserId) || undefined,
      search: normalizeText(search) || undefined,
      page,
      pageSize,
      includeInactive: true,
    },
  });

  const items = toItems(response).map(mapAuditLog);

  return {
    items,
    totalCount: toTotalCount(response, items.length),
  };
}

export function downloadTextFile(fileName, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportRowsToCsv(fileName, columns, rows) {
  const header = columns.map((column) => column.label).join(",");
  const lines = rows.map((row) =>
    columns
      .map((column) => `"${String(row[column.key] ?? "").replaceAll('"', '""')}"`)
      .join(",")
  );

  downloadTextFile(fileName, `\ufeff${[header, ...lines].join("\n")}`, "text/csv;charset=utf-8");
}
