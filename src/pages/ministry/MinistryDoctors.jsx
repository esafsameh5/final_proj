import React, { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaEllipsisVertical,
  FaEye,
  FaFileExport,
  FaHospital,
  FaKey,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaPlus,
  FaShieldHalved,
  FaSpinner,
  FaToggleOn,
  FaTrashCan,
  FaUserDoctor,
  FaUserGroup,
  FaUserShield,
} from "react-icons/fa6";
import ConfirmModal from "../../components/common/ConfirmModal";
import MinistryActionMenu from "../../components/ministry/MinistryActionMenu";
import MinistryDataState from "../../components/ministry/MinistryDataState";
import MinistryFormModal from "../../components/ministry/MinistryFormModal";
import MinistryPageHeader from "../../components/ministry/MinistryPageHeader";
import MinistryPagination from "../../components/ministry/MinistryPagination";
import MinistryStatCard from "../../components/ministry/MinistryStatCard";
import {
  assignGlobalRole,
  assignUserFacilityRole,
  buildDisplayLines,
  checkUserPermission,
  createMinistryDoctor,
  createMinistryNotification,
  deleteMinistryDoctor,
  exportRowsToCsv,
  fetchMinistryDoctors,
  fetchMinistryHospitals,
  fetchMinistryUserDetails,
  fetchMyPermissions,
  fetchUserFacilityRoles,
  formatApiError,
  grantUserPermission,
  reinstateUserFacilityRole,
  revokeGlobalRole,
  revokeUserPermission,
  suspendUserFacilityRole,
  terminateUserFacilityRole,
  updateMinistryDoctor,
  updateMinistryDoctorStatus,
} from "../../services/ministryService";

const initialFormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  nationalNumber: "",
  username: "",
  email: "",
  password: "",
  roleNumber: "",
  gender: "",
  dateOfBirth: "",
  mainHealthFacilityId: "",
};

const initialRoleState = {
  operation: "assign",
  healthFacilityId: "",
  role: "",
  medicalDepartmentId: "",
  reason: "",
  globalRole: "",
};

const initialPermissionState = {
  operation: "grant",
  permission: "",
  healthFacilityId: "",
  medicalDepartmentId: "",
  expiresAt: "",
  facilityId: "",
  departmentId: "",
  resultLines: [],
};

const initialNotificationState = {
  userId: "",
  type: "",
  priority: "",
  channel: "",
  title: "",
  body: "",
  scheduledAt: "",
  relatedEntityType: "",
  relatedEntityId: "",
  metadataJson: "{}",
};

function normalizePermissionLines(data) {
  if (Array.isArray(data)) {
    return data.flatMap((entry, index) => {
      if (typeof entry === "string") {
        return entry;
      }

      return buildDisplayLines(entry, `صلاحية ${index + 1}`);
    });
  }

  return buildDisplayLines(data);
}

function MinistryDoctors({ showToast }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ activeCount: 0, inactiveCount: 0, hospitals: [], specialties: [] });
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [hospitalOptionsError, setHospitalOptionsError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [detailsState, setDetailsState] = useState({ isOpen: false, title: "", lines: [] });
  const [roleState, setRoleState] = useState({ isOpen: false, record: null, values: initialRoleState });
  const [permissionState, setPermissionState] = useState({ isOpen: false, record: null, values: initialPermissionState });
  const [notificationState, setNotificationState] = useState({ isOpen: false, values: initialNotificationState });
  const [myPermissions, setMyPermissions] = useState([]);

  const loadDoctors = async () => {
    const hasRecords = records.length > 0;
    setLoading(true);
    setErrorMessage("");

    const [doctorsResult, hospitalsResult] = await Promise.allSettled([
      fetchMinistryDoctors({
        page,
        pageSize: 8,
        search: searchTerm,
        status: statusFilter,
        specialty: specialtyFilter,
        hospital: hospitalFilter,
      }),
      fetchMinistryHospitals({ page: 1, pageSize: 500 }),
    ]);

    if (doctorsResult.status === "fulfilled") {
      setRecords(doctorsResult.value.items);
      setSummary(doctorsResult.value.summary);
      setTotalPages(doctorsResult.value.totalPages);
      setTotalCount(doctorsResult.value.totalCount);
    } else {
      const message = formatApiError(doctorsResult.reason, "تعذر تحميل بيانات الأطباء من الخادم.");
      console.error("Failed to load ministry doctors:", doctorsResult.reason);
      setErrorMessage(message);
      if (hasRecords) {
        showToast?.(message, "danger");
      }
    }

    if (hospitalsResult.status === "fulfilled") {
      setHospitalOptions(hospitalsResult.value.items);
      setHospitalOptionsError("");
    } else {
      console.error("Failed to load hospital options:", hospitalsResult.reason);
      setHospitalOptions((current) => (current.length > 0 ? current : []));
      setHospitalOptionsError(
        formatApiError(hospitalsResult.reason, "تعذر تحميل قائمة المنشآت المرتبطة.")
      );
    }

    setLoading(false);
  };

  const loadMyPermissions = async () => {
    try {
      const response = await fetchMyPermissions();
      setMyPermissions(normalizePermissionLines(response).slice(0, 10));
    } catch (fetchError) {
      console.error("Failed to load my permissions:", fetchError);
      setMyPermissions([]);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [page, searchTerm, statusFilter, specialtyFilter, hospitalFilter]);

  useEffect(() => {
    loadMyPermissions();
  }, []);

  const statCards = useMemo(() => ([
    { id: "total", label: "إجمالي الأطباء", value: totalCount, icon: <FaUserDoctor /> },
    { id: "active", label: "الأطباء النشطون", value: summary.activeCount || 0, icon: <FaUserGroup />, accent: "var(--accent-emerald)" },
    { id: "inactive", label: "الأطباء الموقوفون", value: summary.inactiveCount || 0, icon: <FaToggleOn />, accent: "var(--accent-red)" },
    { id: "hospitals", label: "المنشآت المرتبطة", value: summary.hospitals?.length || 0, icon: <FaHospital />, accent: "var(--accent-purple)" },
  ]), [summary, totalCount]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormState({
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      nationalNumber: record.nationalNumber === "-" ? "" : record.nationalNumber,
      username: record.username === "-" ? "" : record.username,
      email: record.email === "-" ? "" : record.email,
      password: "",
      roleNumber: Array.isArray(record.roles) ? String(record.roles[0] ?? "") : "",
      gender: record.genderValue === null || record.genderValue === undefined ? "" : String(record.genderValue),
      dateOfBirth: record.dateOfBirth === "-" ? "" : record.dateOfBirth,
      mainHealthFacilityId: record.facilityId || "",
    });
    setIsModalOpen(true);
  };

  const openDetailsModal = async (record) => {
    try {
      const [userDetailsResult, rolesResult] = await Promise.allSettled([
        fetchMinistryUserDetails(record.id),
        fetchUserFacilityRoles(record.id),
      ]);

      if (userDetailsResult.status !== "fulfilled") {
        throw userDetailsResult.reason;
      }

      const userDetails = userDetailsResult.value;
      const roles = rolesResult.status === "fulfilled" ? rolesResult.value : [];

      const lines = [
        `الاسم: ${userDetails.name}`,
        `اسم المستخدم: ${userDetails.username}`,
        `البريد الإلكتروني: ${userDetails.email}`,
        `الرقم القومي: ${userDetails.nationalNumber}`,
        `المنشأة: ${userDetails.hospital}`,
        `النوع: ${userDetails.genderLabel}`,
        `الحالة: ${userDetails.statusLabel}`,
        `تاريخ الميلاد: ${userDetails.dateOfBirth}`,
        ...normalizePermissionLines(roles).slice(0, 8),
      ];

      setDetailsState({
        isOpen: true,
        title: `بيانات ${record.name}`,
        lines,
      });
    } catch (fetchError) {
      console.error("Failed to load user details:", fetchError);
      showToast?.(formatApiError(fetchError, "تعذر تحميل بيانات المستخدم."), "danger");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formState.firstName.trim() ||
      !formState.lastName.trim() ||
      !formState.nationalNumber.trim() ||
      !formState.username.trim() ||
      !formState.email.trim()
    ) {
      showToast?.("يرجى استكمال البيانات الأساسية للمستخدم.", "warning");
      return;
    }

    if (!editingRecord && (!formState.password.trim() || !formState.roleNumber.trim() || !formState.gender.trim())) {
      showToast?.("يرجى إدخال كلمة المرور ورقم الدور ورقم النوع للمستخدم الجديد.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      if (editingRecord) {
        await updateMinistryDoctor(editingRecord.id, formState);
        showToast?.(`تم تحديث بيانات ${editingRecord.name}.`, "success");
      } else {
        await createMinistryDoctor(formState);
        showToast?.("تم إنشاء المستخدم الجديد بنجاح.", "success");
      }

      setIsModalOpen(false);
      setFormState(initialFormState);
      await loadDoctors();
    } catch (submitError) {
      console.error("Failed to submit ministry doctor:", submitError);
      showToast?.(formatApiError(submitError, "تعذر حفظ بيانات المستخدم."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (record) => {
    setConfirmModal({
      isOpen: true,
      title: "تأكيد تغيير حالة المستخدم",
      message: `هل تريد ${record.isActive ? "إيقاف" : "تنشيط"} المستخدم (${record.name})؟`,
      onConfirm: async () => {
        try {
          await updateMinistryDoctorStatus(record.id, !record.isActive);
          await loadDoctors();
          showToast?.(`تم تحديث حالة ${record.name}.`, "success");
        } catch (submitError) {
          console.error("Failed to update user status:", submitError);
          showToast?.(formatApiError(submitError, "تعذر تحديث حالة المستخدم."), "danger");
        } finally {
          setConfirmModal((current) => ({ ...current, isOpen: false }));
        }
      },
    });
  };

  const handleDelete = (record) => {
    setConfirmModal({
      isOpen: true,
      title: "تأكيد تعطيل المستخدم",
      message: `هل أنت متأكد من تعطيل المستخدم (${record.name}) من لوحة الوزارة؟`,
      onConfirm: async () => {
        try {
          await deleteMinistryDoctor(record.id);
          await loadDoctors();
          showToast?.(`تم تعطيل ${record.name}.`, "success");
        } catch (submitError) {
          console.error("Failed to delete user:", submitError);
          showToast?.(formatApiError(submitError, "تعذر تعطيل المستخدم."), "danger");
        } finally {
          setConfirmModal((current) => ({ ...current, isOpen: false }));
        }
      },
    });
  };

  const submitRoleAction = async (event) => {
    event.preventDefault();

    if (!roleState.record) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        targetUserId: roleState.record.id,
        healthFacilityId: roleState.values.healthFacilityId,
        role: roleState.values.role,
        medicalDepartmentId: roleState.values.medicalDepartmentId,
        reason: roleState.values.reason,
        roleToAdd: roleState.values.globalRole,
        roleToRemove: roleState.values.globalRole,
      };

      switch (roleState.values.operation) {
        case "assign":
          await assignUserFacilityRole(payload);
          break;
        case "suspend":
          await suspendUserFacilityRole(payload);
          break;
        case "reinstate":
          await reinstateUserFacilityRole(payload);
          break;
        case "terminate":
          await terminateUserFacilityRole(payload);
          break;
        case "globalAssign":
          await assignGlobalRole(payload);
          break;
        case "globalRevoke":
          await revokeGlobalRole(payload);
          break;
        default:
          break;
      }

      setRoleState({ isOpen: false, record: null, values: initialRoleState });
      await loadDoctors();
      showToast?.("تم تنفيذ عملية الدور بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to submit role action:", submitError);
      showToast?.(formatApiError(submitError, "تعذر تنفيذ عملية الدور."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPermissionAction = async (event) => {
    event.preventDefault();

    if (!permissionState.record) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        targetUserId: permissionState.record.id,
        userId: permissionState.record.id,
        permission: permissionState.values.permission,
        healthFacilityId: permissionState.values.healthFacilityId,
        medicalDepartmentId: permissionState.values.medicalDepartmentId,
        expiresAt: permissionState.values.expiresAt,
        facilityId: permissionState.values.facilityId,
        departmentId: permissionState.values.departmentId,
      };

      if (permissionState.values.operation === "grant") {
        await grantUserPermission(payload);
        await loadMyPermissions();
        showToast?.("تم منح الصلاحية بنجاح.", "success");
        setPermissionState({ isOpen: false, record: null, values: initialPermissionState });
      } else if (permissionState.values.operation === "revoke") {
        await revokeUserPermission(payload);
        await loadMyPermissions();
        showToast?.("تم سحب الصلاحية بنجاح.", "success");
        setPermissionState({ isOpen: false, record: null, values: initialPermissionState });
      } else {
        const response = await checkUserPermission(payload);
        setPermissionState((current) => ({
          ...current,
          values: {
            ...current.values,
            resultLines: buildDisplayLines(response).slice(0, 10),
          },
        }));
        showToast?.("تم فحص الصلاحية بنجاح.", "success");
      }
    } catch (submitError) {
      console.error("Failed to submit permission action:", submitError);
      showToast?.(formatApiError(submitError, "تعذر تنفيذ عملية الصلاحية."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const submitNotification = async (event) => {
    event.preventDefault();

    if (!notificationState.values.userId.trim() || !notificationState.values.title.trim() || !notificationState.values.body.trim()) {
      showToast?.("يرجى استكمال بيانات الإشعار الأساسية.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await createMinistryNotification(notificationState.values);
      setNotificationState({ isOpen: false, values: initialNotificationState });
      showToast?.("تم إرسال الإشعار بنجاح.", "success");
    } catch (submitError) {
      console.error("Failed to send notification:", submitError);
      showToast?.(formatApiError(submitError, "تعذر إرسال الإشعار."), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const exportCurrentRows = () => {
    exportRowsToCsv(
      "ministry-users.csv",
      [
        { key: "name", label: "اسم المستخدم" },
        { key: "email", label: "البريد الإلكتروني" },
        { key: "hospital", label: "المنشأة" },
        { key: "phone", label: "الهاتف" },
        { key: "statusLabel", label: "الحالة" },
      ],
      records
    );
  };

  const hospitalFilterOptions = hospitalOptions
    .map((hospital) => hospital.name)
    .filter((value, index, values) => value && values.indexOf(value) === index);
  const hospitalFilterDisabled = Boolean(hospitalOptionsError) && hospitalFilterOptions.length === 0;
  const hospitalSelectorsDisabled = Boolean(hospitalOptionsError) && hospitalOptions.length === 0;

  return (
    <div id="ministryDoctorsPage" className="page-content active">
      <MinistryPageHeader
        title="الأطباء والمستخدمون"
        description="إدارة حسابات الأطباء مع أدوار المنشآت والصلاحيات والإشعارات من لوحة الوزارة"
      />

      <div className="filters-toolbar ministry-toolbar">
        <button type="button" className="btn" onClick={openCreateModal}>
          <FaPlus />
          إضافة مستخدم
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportCurrentRows}>
          <FaFileExport />
          تصدير
        </button>
        <div className="ministry-filter-control">
          <select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}>
            <option value="all">كل الحالة</option>
            <option value="active">نشط</option>
            <option value="inactive">متوقف</option>
          </select>
        </div>
        <div className="ministry-filter-control">
          <select value={specialtyFilter} onChange={(event) => { setPage(1); setSpecialtyFilter(event.target.value); }}>
            <option value="all">كل التخصصات</option>
            {summary.specialties?.map((specialty) => (
              <option key={String(specialty.value)} value={String(specialty.value)}>{specialty.label}</option>
            ))}
          </select>
        </div>
        <div className="ministry-filter-control">
          <select
            value={hospitalFilter}
            onChange={(event) => { setPage(1); setHospitalFilter(event.target.value); }}
            disabled={hospitalFilterDisabled}
          >
            <option value="all">كل المنشآت</option>
            {hospitalFilterOptions.map((hospital) => (
              <option key={hospital} value={hospital}>{hospital}</option>
            ))}
          </select>
        </div>
        <div className="ministry-search-control">
          <FaMagnifyingGlass className="ministry-search-icon" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد أو الرقم القومي..."
            value={searchTerm}
            onChange={(event) => {
              setPage(1);
              setSearchTerm(event.target.value);
            }}
          />
        </div>
      </div>

      {hospitalOptionsError ? (
        <div style={{ color: "var(--accent-red)", fontSize: "12px", marginBottom: "16px" }}>
          {hospitalOptionsError}
        </div>
      ) : null}

      <div className="cards">
        {statCards.map((card) => (
          <MinistryStatCard
            key={card.id}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </div>

      <div className="box" style={{ overflow: "visible" }}>
        <h2>سجل الأطباء</h2>

        {loading ? (
          <MinistryDataState loading loadingText="جارٍ تحميل سجل الأطباء..." />
        ) : errorMessage ? (
          <MinistryDataState error errorText={errorMessage} onRetry={loadDoctors} />
        ) : records.length === 0 ? (
          <MinistryDataState isEmpty emptyText="لا توجد سجلات أطباء مطابقة للفلاتر الحالية." />
        ) : (
          <>
            <div className="table-container">
              <table style={{ overflow: "visible" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center", width: "70px" }}>#</th>
                    <th>اسم المستخدم</th>
                    <th>التخصص</th>
                    <th>المنشأة</th>
                    <th>البريد الإلكتروني</th>
                    <th style={{ textAlign: "center" }}>الحالة</th>
                    <th style={{ textAlign: "center", width: "90px" }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{(page - 1) * 8 + index + 1}</td>
                      <td style={{ color: "var(--primary)", fontWeight: "700" }}>{record.name}</td>
                      <td>{record.specialty}</td>
                      <td>{record.hospital}</td>
                      <td>{record.email}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={record.isActive ? "status" : "danger"}>{record.statusLabel}</span>
                      </td>
                      <td style={{ textAlign: "center", position: "relative" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", minWidth: "auto" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveMenuId((current) => current === record.id ? null : record.id);
                          }}
                        >
                          <FaEllipsisVertical />
                        </button>
                        <MinistryActionMenu
                          isOpen={activeMenuId === record.id}
                          onClose={() => setActiveMenuId(null)}
                          items={[
                            {
                              label: "عرض التفاصيل",
                              icon: <FaEye />,
                              onClick: () => openDetailsModal(record),
                            },
                            {
                              label: "تعديل البيانات",
                              icon: <FaPenToSquare />,
                              onClick: () => openEditModal(record),
                            },
                            {
                              label: "إدارة الأدوار",
                              icon: <FaUserShield />,
                              onClick: () => setRoleState({
                                isOpen: true,
                                record,
                                values: {
                                  ...initialRoleState,
                                  healthFacilityId: record.facilityId || "",
                                },
                              }),
                            },
                            {
                              label: "إدارة الصلاحيات",
                              icon: <FaShieldHalved />,
                              onClick: () => setPermissionState({
                                isOpen: true,
                                record,
                                values: {
                                  ...initialPermissionState,
                                  healthFacilityId: record.facilityId || "",
                                  facilityId: record.facilityId || "",
                                },
                              }),
                            },
                            {
                              label: "إرسال إشعار",
                              icon: <FaBell />,
                              onClick: () => setNotificationState({
                                isOpen: true,
                                values: { ...initialNotificationState, userId: record.id },
                              }),
                            },
                            {
                              label: "تغيير الحالة",
                              icon: <FaToggleOn />,
                              onClick: () => handleToggleStatus(record),
                            },
                            {
                              label: "تعطيل المستخدم",
                              icon: <FaTrashCan />,
                              tone: "danger",
                              onClick: () => handleDelete(record),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <MinistryPagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              currentCount={records.length}
              label="مستخدم"
              onChange={setPage}
            />
          </>
        )}
      </div>

      <div className="box" style={{ marginTop: "25px" }}>
        <h2>صلاحياتي الحالية</h2>
        {myPermissions.length === 0 ? (
          <MinistryDataState isEmpty emptyText="لم يتم إرجاع صلاحيات قابلة للعرض للحساب الحالي." />
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {myPermissions.map((line) => (
              <div
                key={line}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  background: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <MinistryFormModal
          title={editingRecord ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
          subtitle="يعتمد هذا النموذج على عقد إنشاء/تعديل المستخدم الموثق في وزارة الصحة"
          onClose={() => setIsModalOpen(false)}
          width="760px"
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <input placeholder="الاسم الأول" value={formState.firstName} onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))} />
              <input placeholder="الاسم الأوسط" value={formState.middleName} onChange={(event) => setFormState((current) => ({ ...current, middleName: event.target.value }))} />
              <input placeholder="الاسم الأخير" value={formState.lastName} onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <input placeholder="الرقم القومي" value={formState.nationalNumber} onChange={(event) => setFormState((current) => ({ ...current, nationalNumber: event.target.value }))} />
              <input placeholder="اسم المستخدم" value={formState.username} onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <input type="email" placeholder="البريد الإلكتروني" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} />
              <input type="date" value={formState.dateOfBirth} onChange={(event) => setFormState((current) => ({ ...current, dateOfBirth: event.target.value }))} />
            </div>
            {!editingRecord ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <input placeholder="رقم الدور" value={formState.roleNumber} onChange={(event) => setFormState((current) => ({ ...current, roleNumber: event.target.value }))} />
                <input placeholder="رقم النوع" value={formState.gender} onChange={(event) => setFormState((current) => ({ ...current, gender: event.target.value }))} />
                <input type="password" placeholder="كلمة المرور" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input placeholder="رقم النوع" value={formState.gender} onChange={(event) => setFormState((current) => ({ ...current, gender: event.target.value }))} />
                <input placeholder="رقم الدور الحالي (مرجعي)" value={formState.roleNumber} onChange={(event) => setFormState((current) => ({ ...current, roleNumber: event.target.value }))} />
              </div>
            )}
            <div>
              <label>المنشأة الرئيسية</label>
              <select
                value={formState.mainHealthFacilityId}
                onChange={(event) => setFormState((current) => ({ ...current, mainHealthFacilityId: event.target.value }))}
                disabled={hospitalSelectorsDisabled}
              >
                <option value="">بدون منشأة</option>
                {hospitalOptions.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-start", marginTop: "6px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : null}
                {editingRecord ? "حفظ التعديلات" : "إضافة المستخدم"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      {detailsState.isOpen ? (
        <MinistryFormModal
          title={detailsState.title}
          subtitle="عرض تفاصيل المستخدم والأدوار المرتبطة بالمنشآت"
          onClose={() => setDetailsState({ isOpen: false, title: "", lines: [] })}
          width="620px"
        >
          <div style={{ display: "grid", gap: "10px" }}>
            {detailsState.lines.map((line) => (
              <div
                key={line}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  background: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "20px" }}>
            <button type="button" className="btn" onClick={() => setDetailsState({ isOpen: false, title: "", lines: [] })}>تم</button>
          </div>
        </MinistryFormModal>
      ) : null}

      {roleState.isOpen ? (
        <MinistryFormModal
          title={`إدارة الأدوار للمستخدم ${roleState.record?.name || ""}`}
          subtitle="تستخدم هذه الشاشة endpoints أدوار المنشآت والأدوار العامة كما هي موثقة"
          onClose={() => setRoleState({ isOpen: false, record: null, values: initialRoleState })}
          width="620px"
        >
          <form onSubmit={submitRoleAction} style={{ display: "grid", gap: "14px" }}>
            <select
              value={roleState.values.operation}
              onChange={(event) =>
                setRoleState((current) => ({
                  ...current,
                  values: { ...current.values, operation: event.target.value },
                }))
              }
            >
              <option value="assign">تعيين دور داخل منشأة</option>
              <option value="suspend">إيقاف دور داخل منشأة</option>
              <option value="reinstate">إعادة تفعيل دور داخل منشأة</option>
              <option value="terminate">إنهاء دور داخل منشأة</option>
              <option value="globalAssign">إضافة دور عام</option>
              <option value="globalRevoke">إزالة دور عام</option>
            </select>

            {roleState.values.operation.startsWith("global") ? (
              <input
                placeholder="رقم الدور العام"
                value={roleState.values.globalRole}
                onChange={(event) =>
                  setRoleState((current) => ({
                    ...current,
                    values: { ...current.values, globalRole: event.target.value },
                  }))
                }
              />
            ) : (
              <>
                <select
                  value={roleState.values.healthFacilityId}
                  onChange={(event) =>
                    setRoleState((current) => ({
                      ...current,
                      values: { ...current.values, healthFacilityId: event.target.value },
                    }))
                  }
                  disabled={hospitalSelectorsDisabled}
                >
                  <option value="">اختر المنشأة</option>
                  {hospitalOptions.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                  ))}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    placeholder="رقم الدور"
                    value={roleState.values.role}
                    onChange={(event) =>
                      setRoleState((current) => ({
                        ...current,
                        values: { ...current.values, role: event.target.value },
                      }))
                    }
                  />
                  <input
                    placeholder="معرف القسم الطبي (اختياري)"
                    value={roleState.values.medicalDepartmentId}
                    onChange={(event) =>
                      setRoleState((current) => ({
                        ...current,
                        values: { ...current.values, medicalDepartmentId: event.target.value },
                      }))
                    }
                  />
                </div>
              </>
            )}

            {["suspend", "terminate"].includes(roleState.values.operation) ? (
              <textarea
                rows="4"
                placeholder="السبب"
                value={roleState.values.reason}
                onChange={(event) =>
                  setRoleState((current) => ({
                    ...current,
                    values: { ...current.values, reason: event.target.value },
                  }))
                }
              />
            ) : null}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaUserShield />}
                تنفيذ
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setRoleState({ isOpen: false, record: null, values: initialRoleState })}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      {permissionState.isOpen ? (
        <MinistryFormModal
          title={`إدارة الصلاحيات للمستخدم ${permissionState.record?.name || ""}`}
          subtitle="منح وسحب وفحص الصلاحيات حسب endpoints الوزارة الموثقة"
          onClose={() => setPermissionState({ isOpen: false, record: null, values: initialPermissionState })}
          width="640px"
        >
          <form onSubmit={submitPermissionAction} style={{ display: "grid", gap: "14px" }}>
            <select
              value={permissionState.values.operation}
              onChange={(event) =>
                setPermissionState((current) => ({
                  ...current,
                  values: { ...current.values, operation: event.target.value, resultLines: [] },
                }))
              }
            >
              <option value="grant">منح صلاحية</option>
              <option value="revoke">سحب صلاحية</option>
              <option value="check">فحص صلاحية</option>
            </select>
            <input
              placeholder="رقم الصلاحية"
              value={permissionState.values.permission}
              onChange={(event) =>
                setPermissionState((current) => ({
                  ...current,
                  values: { ...current.values, permission: event.target.value },
                }))
              }
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <select
                value={permissionState.values.healthFacilityId || permissionState.values.facilityId}
                onChange={(event) =>
                  setPermissionState((current) => ({
                    ...current,
                    values: {
                      ...current.values,
                      healthFacilityId: event.target.value,
                      facilityId: event.target.value,
                    },
                  }))
                }
                disabled={hospitalSelectorsDisabled}
              >
                <option value="">بدون منشأة</option>
                {hospitalOptions.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                ))}
              </select>
              <input
                placeholder="معرف القسم الطبي"
                value={permissionState.values.medicalDepartmentId || permissionState.values.departmentId}
                onChange={(event) =>
                  setPermissionState((current) => ({
                    ...current,
                    values: {
                      ...current.values,
                      medicalDepartmentId: event.target.value,
                      departmentId: event.target.value,
                    },
                  }))
                }
              />
            </div>
            {permissionState.values.operation === "grant" ? (
              <input
                type="datetime-local"
                value={permissionState.values.expiresAt}
                onChange={(event) =>
                  setPermissionState((current) => ({
                    ...current,
                    values: { ...current.values, expiresAt: event.target.value },
                  }))
                }
              />
            ) : null}
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaShieldHalved />}
                تنفيذ
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPermissionState({ isOpen: false, record: null, values: initialPermissionState })}>إلغاء</button>
            </div>
            {permissionState.values.resultLines?.length ? (
              <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                {permissionState.values.resultLines.map((line) => (
                  <div
                    key={line}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      background: "#f8fafc",
                      fontSize: "13px",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : null}
          </form>
        </MinistryFormModal>
      ) : null}

      {notificationState.isOpen ? (
        <MinistryFormModal
          title="إرسال إشعار"
          subtitle="إرسال إشعار مباشر للمستخدم باستخدام endpoint الإشعارات"
          onClose={() => setNotificationState({ isOpen: false, values: initialNotificationState })}
          width="640px"
        >
          <form onSubmit={submitNotification} style={{ display: "grid", gap: "14px" }}>
            <input value={notificationState.values.userId} readOnly />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <input placeholder="رقم النوع" value={notificationState.values.type} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, type: event.target.value } }))} />
              <input placeholder="رقم الأولوية" value={notificationState.values.priority} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, priority: event.target.value } }))} />
              <input placeholder="رقم القناة" value={notificationState.values.channel} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, channel: event.target.value } }))} />
            </div>
            <input placeholder="عنوان الإشعار" value={notificationState.values.title} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, title: event.target.value } }))} />
            <textarea rows="4" placeholder="نص الإشعار" value={notificationState.values.body} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, body: event.target.value } }))} />
            <input type="datetime-local" value={notificationState.values.scheduledAt} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, scheduledAt: event.target.value } }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <input placeholder="نوع الكيان المرتبط" value={notificationState.values.relatedEntityType} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, relatedEntityType: event.target.value } }))} />
              <input placeholder="معرف الكيان المرتبط" value={notificationState.values.relatedEntityId} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, relatedEntityId: event.target.value } }))} />
            </div>
            <textarea rows="3" placeholder="Metadata JSON" value={notificationState.values.metadataJson} onChange={(event) => setNotificationState((current) => ({ ...current, values: { ...current.values, metadataJson: event.target.value } }))} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaBell />}
                إرسال الإشعار
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setNotificationState({ isOpen: false, values: initialNotificationState })}>إلغاء</button>
            </div>
          </form>
        </MinistryFormModal>
      ) : null}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((current) => ({ ...current, isOpen: false }))}
      />
    </div>
  );
}

export default MinistryDoctors;
