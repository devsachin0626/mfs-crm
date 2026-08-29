import type {
  PayrollStatus,
} from "../../types/payroll.types";

/* ============================
   PROPS
============================ */

type Props = {
  status:
    PayrollStatus;
};

/* ============================
   CONFIG
============================ */

const STATUS_CONFIG: Record<
  PayrollStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Pending",

    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  GENERATED: {
    label: "Generated",

    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  APPROVED: {
    label: "Approved",

    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  PAID: {
    label: "Paid",

    className:
      "border-green-200 bg-green-50 text-green-700",
  },
};

/* ============================
   COMPONENT
============================ */

export default function PayrollStatusBadge({
  status,
}: Props) {
  const config =
    STATUS_CONFIG[
      status
    ];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}