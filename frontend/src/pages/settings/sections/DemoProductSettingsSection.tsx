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
  createDemoProduct,
  deleteDemoProduct,
  getDemoProducts,
  toggleDemoProduct,
  updateDemoProduct,
} from "../../../services/demoProduct.service";

import type {
  DemoProduct,
} from "../../../types/settings.types";

import {
  SettingsCard,
  SettingsSectionHeader,
  SettingsStatusBadge,
} from "../SettingsLayout";

/* ============================
   FORM TYPE
============================ */

type DemoProductForm = {
  code: string;

  name: string;

  description: string;

  sortOrder: string;

  isActive: boolean;
};

/* ============================
   INITIAL FORM
============================ */

const INITIAL_FORM:
  DemoProductForm = {
    code: "",

    name: "",

    description: "",

    sortOrder: "0",

    isActive: true,
  };

/* ============================
   PAGE
============================ */

export default function DemoProductSettingsSection() {
  const [
    products,
    setProducts,
  ] =
    useState<
      DemoProduct[]
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
    search,
    setSearch,
  ] =
    useState("");

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

  /* ============================
     MODAL
  ============================ */

  const [
    showModal,
    setShowModal,
  ] =
    useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] =
    useState<
      DemoProduct | null
    >(null);

  const [
    form,
    setForm,
  ] =
    useState<DemoProductForm>(
      INITIAL_FORM
    );

  /* ============================
     LOAD DATA
  ============================ */

  const loadProducts =
    async () => {
      try {
        setLoading(
          true
        );

        setError(
          null
        );

        const data =
          await getDemoProducts();

        setProducts(
          data
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
    void loadProducts();
  }, []);

  /* ============================
     FILTER
  ============================ */

  const filteredProducts =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return products;
      }

      return products.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              value
            ) ||
          item.code
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
      products,
      search,
    ]);

  /* ============================
     CREATE MODAL
  ============================ */

  const openCreateModal =
    () => {
      setEditingProduct(
        null
      );

      setForm({
        ...INITIAL_FORM,
      });

      setShowModal(
        true
      );
    };

  /* ============================
     EDIT MODAL
  ============================ */

  const openEditModal =
    (
      product:
        DemoProduct
    ) => {
      setEditingProduct(
        product
      );

      setForm({
        code:
          product.code,

        name:
          product.name,

        description:
          product.description ||
          "",

        sortOrder:
          String(
            product.sortOrder ??
              0
          ),

        isActive:
          product.isActive,
      });

      setShowModal(
        true
      );
    };

  /* ============================
     SAVE
  ============================ */

  const handleSave =
    async () => {
      const code =
        form.code
          .trim()
          .toUpperCase();

      const name =
        form.name.trim();

      if (!code) {
        setError(
          "Demo product code is required."
        );

        return;
      }

      if (!name) {
        setError(
          "Demo product name is required."
        );

        return;
      }

      const sortOrder =
        Number(
          form.sortOrder
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
        setSaving(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );

        const payload = {
          code,

          name,

          description:
            form.description
              .trim() ||
            null,

          sortOrder,

          isActive:
            form.isActive,
        };

        if (
          editingProduct
        ) {
          await updateDemoProduct(
            editingProduct.id,
            payload
          );

          setSuccess(
            "Demo product updated successfully."
          );
        } else {
          await createDemoProduct(
            payload
          );

          setSuccess(
            "Demo product created successfully."
          );
        }

        setShowModal(
          false
        );

        setEditingProduct(
          null
        );

        await loadProducts();
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
     TOGGLE
  ============================ */

  const handleToggle =
    async (
      product:
        DemoProduct
    ) => {
      try {
        setError(
          null
        );

        setSuccess(
          null
        );

        await toggleDemoProduct(
          product.id
        );

        setSuccess(
          `Demo product ${
            product.isActive
              ? "deactivated"
              : "activated"
          } successfully.`
        );

        await loadProducts();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      }
    };

  /* ============================
     DELETE
  ============================ */

  const handleDelete =
    async (
      product:
        DemoProduct
    ) => {
      const confirmed =
        window.confirm(
          `Delete demo product "${product.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          product.id
        );

        setError(
          null
        );

        setSuccess(
          null
        );

        await deleteDemoProduct(
          product.id
        );

        setSuccess(
          "Demo product deleted successfully."
        );

        await loadProducts();
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

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <SettingsSectionHeader
        title="Demo Products"
        description="Manage categories used while creating Trial / Demo records, such as Cash, Options, Futures, MCX, Pre-IPO and Demat."
        action={
          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <CirclePlus
              size={17}
            />

            Add Demo Product
          </button>
        }
      />

      {/* ============================
          MESSAGES
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
          TABLE CARD
      ============================ */}

      <SettingsCard>
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Demo Product List
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {
                products.length
              }{" "}
              products configured
            </p>
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
              placeholder="Search demo products..."
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-blue-700"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading demo products...
              </p>
            </div>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <p className="font-semibold text-slate-700">
              No demo products found
            </p>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Add Cash, Options,
              Futures, MCX,
              Pre-IPO, Demat or
              another demo category.
            </p>

            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <CirclePlus
                size={16}
              />

              Add Demo Product
            </button>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <TableHead>
                    Product
                  </TableHead>

                  <TableHead>
                    Code
                  </TableHead>

                  <TableHead>
                    Description
                  </TableHead>

                  <TableHead>
                    Order
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead align="right">
                    Actions
                  </TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={
                        product.id
                      }
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {
                            product.name
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700">
                          {
                            product.code
                          }
                        </span>
                      </td>

                      <td className="max-w-md px-4 py-4 text-sm text-slate-500">
                        {product.description ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {
                          product.sortOrder
                        }
                      </td>

                      <td className="px-4 py-4">
                        <SettingsStatusBadge
                          active={
                            product.isActive
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                product
                              )
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                              product.isActive
                                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {product.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                product
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
                              product.id
                            }
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            {deletingId ===
                            product.id ? (
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
          </div>
        )}
      </SettingsCard>

      {/* ============================
          MODAL
      ============================ */}

      {showModal && (
        <Modal
          title={
            editingProduct
              ? "Edit Demo Product"
              : "Add Demo Product"
          }
          description="This product will be available as a Trial / Demo category when active."
          onClose={() => {
            if (
              saving
            ) {
              return;
            }

            setShowModal(
              false
            );

            setEditingProduct(
              null
            );
          }}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name">
                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
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
                  placeholder="e.g. Options"
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field label="Product Code">
                <input
                  type="text"
                  value={
                    form.code
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        code:
                          event
                            .target
                            .value
                            .toUpperCase(),
                      })
                    )
                  }
                  placeholder="e.g. OPTIONS"
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={4}
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  setForm(
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

            <Field label="Sort Order">
              <input
                type="number"
                min="0"
                value={
                  form.sortOrder
                }
                onChange={(
                  event
                ) =>
                  setForm(
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

              <p className="mt-1 text-xs text-slate-400">
                Lower number appears
                first in dropdowns.
              </p>
            </Field>

            <ToggleField
              label="Active"
              description="Only active demo products should appear while creating a new Trial / Demo."
              checked={
                form.isActive
              }
              onChange={(
                checked
              ) =>
                setForm(
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

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(
                    false
                  );

                  setEditingProduct(
                    null
                  );
                }}
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
                  handleSave
                }
                disabled={
                  saving
                }
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </button>
            </div>
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
   ERROR MESSAGE
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