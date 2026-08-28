import {
  Check,
  CirclePlus,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createLeadSource,
  deleteLeadSource,
  getLeadSources,
  updateLeadSource,
} from "../../../services/leadSource.service";

import {
  createLeadStatus,
  deleteLeadStatus,
  getLeadStatuses,
  updateLeadStatus,
} from "../../../services/leadStatus.service";

import type {
  SettingsLeadSource,
  SettingsLeadStatus,
} from "../../../types/settings.types";

import {
  SettingsCard,
  SettingsSectionHeader,
  SettingsStatusBadge,
} from "../SettingsLayout";

/* ============================
   TYPES
============================ */

type ActiveTab =
  | "STATUS"
  | "SOURCE";

type StatusForm = {
  name: string;
  color: string;
  sortOrder: string;
  isActive: boolean;
};

type SourceForm = {
  name: string;
  description: string;
  isActive: boolean;
};

/* ============================
   INITIAL VALUES
============================ */

const INITIAL_STATUS_FORM:
  StatusForm = {
    name: "",
    color: "#2563eb",
    sortOrder: "0",
    isActive: true,
  };

const INITIAL_SOURCE_FORM:
  SourceForm = {
    name: "",
    description: "",
    isActive: true,
  };

/* ============================
   PAGE
============================ */

export default function LeadSettingsSection() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ActiveTab>(
      "STATUS"
    );

  const [
    statuses,
    setStatuses,
  ] =
    useState<
      SettingsLeadStatus[]
    >([]);

  const [
    sources,
    setSources,
  ] =
    useState<
      SettingsLeadSource[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const [
    search,
    setSearch,
  ] =
    useState("");

  /* ============================
     MODAL
  ============================ */

  const [
    showStatusModal,
    setShowStatusModal,
  ] =
    useState(false);

  const [
    editingStatus,
    setEditingStatus,
  ] =
    useState<
      SettingsLeadStatus | null
    >(null);

  const [
    statusForm,
    setStatusForm,
  ] =
    useState<StatusForm>(
      INITIAL_STATUS_FORM
    );

  const [
    showSourceModal,
    setShowSourceModal,
  ] =
    useState(false);

  const [
    editingSource,
    setEditingSource,
  ] =
    useState<
      SettingsLeadSource | null
    >(null);

  const [
    sourceForm,
    setSourceForm,
  ] =
    useState<SourceForm>(
      INITIAL_SOURCE_FORM
    );

  /* ============================
     LOAD DATA
  ============================ */

  const loadData =
    async () => {
      try {
        setLoading(true);

        setError(null);

        const [
          statusResponse,
          sourceResponse,
        ] =
          await Promise.all([
            getLeadStatuses(),

            getLeadSources({
              includeInactive:
                true,
            }),
          ]);

        setStatuses(
          Array.isArray(
            statusResponse
              ?.leadStatuses
          )
            ? statusResponse
                .leadStatuses
            : []
        );

        setSources(
          Array.isArray(
            sourceResponse
              ?.leadSources
          )
            ? sourceResponse
                .leadSources
            : []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  useEffect(() => {
    void loadData();
  }, []);

  /* ============================
     FILTERED
  ============================ */

  const filteredStatuses =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return statuses;
      }

      return statuses.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [
      statuses,
      search,
    ]);

  const filteredSources =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return sources;
      }

      return sources.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              value
            ) ||
          (
            item.description ||
            ""
          )
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [
      sources,
      search,
    ]);

  /* ============================
     OPEN STATUS CREATE
  ============================ */

  const openCreateStatus =
    () => {
      setEditingStatus(
        null
      );

      setStatusForm({
        ...INITIAL_STATUS_FORM,
      });

      setShowStatusModal(
        true
      );
    };

  /* ============================
     OPEN STATUS EDIT
  ============================ */

  const openEditStatus =
    (
      status:
        SettingsLeadStatus
    ) => {
      setEditingStatus(
        status
      );

      setStatusForm({
        name:
          status.name,

        color:
          status.color ||
          "#2563eb",

        sortOrder:
          String(
            status.sortOrder ??
              0
          ),

        isActive:
          status.isActive,
      });

      setShowStatusModal(
        true
      );
    };

  /* ============================
     SAVE STATUS
  ============================ */

  const handleSaveStatus =
    async () => {
      const name =
        statusForm.name.trim();

      if (!name) {
        setError(
          "Status name is required."
        );

        return;
      }

      const sortOrder =
        Number(
          statusForm.sortOrder
        );

      if (
        Number.isNaN(
          sortOrder
        )
      ) {
        setError(
          "Sort order must be a valid number."
        );

        return;
      }

      try {
        setSaving(true);

        setError(null);

        setSuccess(null);

        const payload = {
          name,

          color:
            statusForm.color ||
            null,

          sortOrder,

          isActive:
            statusForm.isActive,
        };

        if (
          editingStatus
        ) {
          await updateLeadStatus(
            editingStatus.id,
            payload
          );

          setSuccess(
            "Lead status updated successfully."
          );
        } else {
          await createLeadStatus(
            payload
          );

          setSuccess(
            "Lead status created successfully."
          );
        }

        setShowStatusModal(
          false
        );

        setEditingStatus(
          null
        );

        await loadData();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================
     TOGGLE STATUS
  ============================ */

  const toggleStatus =
    async (
      status:
        SettingsLeadStatus
    ) => {
      try {
        setError(null);

        setSuccess(null);

        await updateLeadStatus(
          status.id,
          {
            isActive:
              !status.isActive,
          }
        );

        setSuccess(
          `Lead status ${
            status.isActive
              ? "deactivated"
              : "activated"
          } successfully.`
        );

        await loadData();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      }
    };

  /* ============================
     DELETE STATUS
  ============================ */

  const handleDeleteStatus =
    async (
      status:
        SettingsLeadStatus
    ) => {
      const confirmed =
        window.confirm(
          `Delete lead status "${status.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          status.id
        );

        setError(null);

        setSuccess(null);

        await deleteLeadStatus(
          status.id
        );

        setSuccess(
          "Lead status deleted successfully."
        );

        await loadData();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* ============================
     OPEN SOURCE CREATE
  ============================ */

  const openCreateSource =
    () => {
      setEditingSource(
        null
      );

      setSourceForm({
        ...INITIAL_SOURCE_FORM,
      });

      setShowSourceModal(
        true
      );
    };

  /* ============================
     OPEN SOURCE EDIT
  ============================ */

  const openEditSource =
    (
      source:
        SettingsLeadSource
    ) => {
      setEditingSource(
        source
      );

      setSourceForm({
        name:
          source.name,

        description:
          source.description ||
          "",

        isActive:
          source.isActive,
      });

      setShowSourceModal(
        true
      );
    };

  /* ============================
     SAVE SOURCE
  ============================ */

  const handleSaveSource =
    async () => {
      const name =
        sourceForm.name.trim();

      if (!name) {
        setError(
          "Source name is required."
        );

        return;
      }

      try {
        setSaving(true);

        setError(null);

        setSuccess(null);

        const payload = {
          name,

          description:
            sourceForm.description
              .trim() ||
            null,

          isActive:
            sourceForm.isActive,
        };

        if (
          editingSource
        ) {
          await updateLeadSource(
            editingSource.id,
            payload
          );

          setSuccess(
            "Lead source updated successfully."
          );
        } else {
          await createLeadSource(
            payload
          );

          setSuccess(
            "Lead source created successfully."
          );
        }

        setShowSourceModal(
          false
        );

        setEditingSource(
          null
        );

        await loadData();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================
     TOGGLE SOURCE
  ============================ */

  const toggleSource =
    async (
      source:
        SettingsLeadSource
    ) => {
      try {
        setError(null);

        setSuccess(null);

        await updateLeadSource(
          source.id,
          {
            isActive:
              !source.isActive,
          }
        );

        setSuccess(
          `Lead source ${
            source.isActive
              ? "deactivated"
              : "activated"
          } successfully.`
        );

        await loadData();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      }
    };

  /* ============================
     DELETE SOURCE
  ============================ */

  const handleDeleteSource =
    async (
      source:
        SettingsLeadSource
    ) => {
      const confirmed =
        window.confirm(
          `Delete lead source "${source.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          source.id
        );

        setError(null);

        setSuccess(null);

        await deleteLeadSource(
          source.id
        );

        setSuccess(
          "Lead source deleted successfully."
        );

        await loadData();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* ============================
     ADD BUTTON
  ============================ */

  const handleAdd =
    () => {
      if (
        activeTab ===
        "STATUS"
      ) {
        openCreateStatus();

        return;
      }

      openCreateSource();
    };

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <SettingsSectionHeader
        title="Lead Settings"
        description="Manage lead statuses and lead sources used across lead forms, filters, pipeline and calling workflows."
        action={
          <button
            type="button"
            onClick={
              handleAdd
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <CirclePlus
              size={17}
            />

            {activeTab ===
            "STATUS"
              ? "Add Status"
              : "Add Source"}
          </button>
        }
      />

      {/* ============================
          MESSAGE
      ============================ */}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError(
                null
              )
            }
          >
            <X
              size={16}
            />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <Check
              size={16}
            />

            <span>
              {success}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccess(
                null
              )
            }
          >
            <X
              size={16}
            />
          </button>
        </div>
      )}

      {/* ============================
          MAIN CARD
      ============================ */}

      <SettingsCard>
        {/* TABS + SEARCH */}

        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "STATUS"
                )
              }
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab ===
                "STATUS"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lead Statuses

              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {
                  statuses.length
                }
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "SOURCE"
                )
              }
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab ===
                "SOURCE"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lead Sources

              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {
                  sources.length
                }
              </span>
            </button>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder={
                activeTab ===
                "STATUS"
                  ? "Search statuses..."
                  : "Search sources..."
              }
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-blue-700"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading lead settings...
              </p>
            </div>
          </div>
        ) : activeTab ===
          "STATUS" ? (
          /* ============================
             STATUS TABLE
          ============================ */

          <div className="mt-5 overflow-x-auto">
            {filteredStatuses.length ===
            0 ? (
              <EmptyState
                title="No lead statuses found"
                description="Add a lead status to start managing your lead workflow."
                buttonLabel="Add Status"
                onClick={
                  openCreateStatus
                }
              />
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Color
                    </TableHead>

                    <TableHead>
                      Sort Order
                    </TableHead>

                    <TableHead>
                      State
                    </TableHead>

                    <TableHead align="right">
                      Actions
                    </TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStatuses.map(
                    (status) => (
                      <tr
                        key={
                          status.id
                        }
                        className="hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              status.name
                            }
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-5 w-5 rounded-full border border-slate-200"
                              style={{
                                backgroundColor:
                                  status.color ||
                                  "#cbd5e1",
                              }}
                            />

                            <span className="text-xs text-slate-500">
                              {status.color ||
                                "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {
                            status.sortOrder
                          }
                        </td>

                        <td className="px-4 py-4">
                          <SettingsStatusBadge
                            active={
                              status.isActive
                            }
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(
                                  status
                                )
                              }
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                status.isActive
                                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {status.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditStatus(
                                  status
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <Pencil
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                status.id
                              }
                              onClick={() =>
                                handleDeleteStatus(
                                  status
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              {deletingId ===
                              status.id ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={15}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* ============================
             SOURCE TABLE
          ============================ */

          <div className="mt-5 overflow-x-auto">
            {filteredSources.length ===
            0 ? (
              <EmptyState
                title="No lead sources found"
                description="Add lead sources such as Calling, Referral, Website or Campaign."
                buttonLabel="Add Source"
                onClick={
                  openCreateSource
                }
              />
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <TableHead>
                      Source
                    </TableHead>

                    <TableHead>
                      Description
                    </TableHead>

                    <TableHead>
                      State
                    </TableHead>

                    <TableHead align="right">
                      Actions
                    </TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSources.map(
                    (source) => (
                      <tr
                        key={
                          source.id
                        }
                        className="hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {
                              source.name
                            }
                          </p>
                        </td>

                        <td className="max-w-md px-4 py-4 text-sm text-slate-500">
                          {source.description ||
                            "-"}
                        </td>

                        <td className="px-4 py-4">
                          <SettingsStatusBadge
                            active={
                              source.isActive
                            }
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleSource(
                                  source
                                )
                              }
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                source.isActive
                                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {source.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditSource(
                                  source
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <Pencil
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                source.id
                              }
                              onClick={() =>
                                handleDeleteSource(
                                  source
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              {deletingId ===
                              source.id ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={15}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </SettingsCard>

      {/* ============================
          STATUS MODAL
      ============================ */}

      {showStatusModal && (
        <Modal
          title={
            editingStatus
              ? "Edit Lead Status"
              : "Add Lead Status"
          }
          description="Configure how this status appears across Leads, Calling and Pipeline."
          onClose={() => {
            if (
              saving
            ) {
              return;
            }

            setShowStatusModal(
              false
            );

            setEditingStatus(
              null
            );
          }}
        >
          <div className="space-y-4">
            <Field label="Status Name">
              <input
                type="text"
                value={
                  statusForm.name
                }
                onChange={(
                  event
                ) =>
                  setStatusForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      name:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="e.g. Interested"
                className={
                  inputClass
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Color">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={
                      statusForm.color
                    }
                    onChange={(
                      event
                    ) =>
                      setStatusForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          color:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />

                  <input
                    type="text"
                    value={
                      statusForm.color
                    }
                    onChange={(
                      event
                    ) =>
                      setStatusForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          color:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </div>
              </Field>

              <Field label="Sort Order">
                <input
                  type="number"
                  min="0"
                  value={
                    statusForm.sortOrder
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        sortOrder:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

            <ToggleField
              label="Active"
              description="Inactive statuses will remain in history but should not be used for new selections."
              checked={
                statusForm.isActive
              }
              onChange={(
                checked
              ) =>
                setStatusForm(
                  (
                    previous
                  ) => ({
                    ...previous,

                    isActive:
                      checked,
                  })
                )
              }
            />

            <ModalActions
              saving={
                saving
              }
              saveLabel={
                editingStatus
                  ? "Update Status"
                  : "Create Status"
              }
              onCancel={() => {
                setShowStatusModal(
                  false
                );

                setEditingStatus(
                  null
                );
              }}
              onSave={
                handleSaveStatus
              }
            />
          </div>
        </Modal>
      )}

      {/* ============================
          SOURCE MODAL
      ============================ */}

      {showSourceModal && (
        <Modal
          title={
            editingSource
              ? "Edit Lead Source"
              : "Add Lead Source"
          }
          description="Lead sources identify where a lead originated."
          onClose={() => {
            if (
              saving
            ) {
              return;
            }

            setShowSourceModal(
              false
            );

            setEditingSource(
              null
            );
          }}
        >
          <div className="space-y-4">
            <Field label="Source Name">
              <input
                type="text"
                value={
                  sourceForm.name
                }
                onChange={(
                  event
                ) =>
                  setSourceForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      name:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="e.g. Calling"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={4}
                value={
                  sourceForm.description
                }
                onChange={(
                  event
                ) =>
                  setSourceForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      description:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="Optional description"
                className={`${inputClass} resize-none`}
              />
            </Field>

            <ToggleField
              label="Active"
              description="Only active sources should be available when creating or editing leads."
              checked={
                sourceForm.isActive
              }
              onChange={(
                checked
              ) =>
                setSourceForm(
                  (
                    previous
                  ) => ({
                    ...previous,

                    isActive:
                      checked,
                  })
                )
              }
            />

            <ModalActions
              saving={
                saving
              }
              saveLabel={
                editingSource
                  ? "Update Source"
                  : "Create Source"
              }
              onCancel={() => {
                setShowSourceModal(
                  false
                );

                setEditingSource(
                  null
                );
              }}
              onSave={
                handleSaveSource
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================
   MODAL
============================ */

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;

  description?: string;

  onClose:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>

            {description && (
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {
                  description
                }
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================
   MODAL ACTIONS
============================ */

function ModalActions({
  saving,
  saveLabel,
  onCancel,
  onSave,
}: {
  saving: boolean;

  saveLabel: string;

  onCancel:
    () => void;

  onSave:
    () => void;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={
          onCancel
        }
        disabled={
          saving
        }
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={
          onSave
        }
        disabled={
          saving
        }
        className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {saving && (
          <Loader2
            size={16}
            className="animate-spin"
          />
        )}

        {saveLabel}
      </button>
    </div>
  );
}

/* ============================
   FIELD
============================ */

function Field({
  label,
  children,
}: {
  label: string;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ============================
   TOGGLE
============================ */

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;

  description?: string;

  checked: boolean;

  onChange:
    (
      value: boolean
    ) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {
              description
            }
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-700"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ============================
   EMPTY STATE
============================ */

function EmptyState({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;

  description: string;

  buttonLabel: string;

  onClick:
    () => void;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <p className="font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={
          onClick
        }
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
      >
        <CirclePlus
          size={16}
        />

        {buttonLabel}
      </button>
    </div>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
  align = "left",
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* ============================
   ERROR
============================ */

function getErrorMessage(
  error: unknown
) {
  if (
    typeof error ===
      "object" &&
    error !== null
  ) {
    const apiError =
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };

        message?: string;
      };

    return (
      apiError.response
        ?.data?.message ||
      apiError.message ||
      "Something went wrong"
    );
  }

  return "Something went wrong";
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";