import {
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  setCredentials,
} from "../../store/slices/authSlice";

import {
  clearImpersonationSession,
  getImpersonationSession,
  setToken,
} from "../../utils/auth";

export default function ImpersonationBanner() {
  const dispatch =
    useAppDispatch();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const session =
    getImpersonationSession();

  if (
    !session ||
    !employee
  ) {
    return null;
  }

  const returnToAdmin =
    () => {
      setToken(
        session.token
      );

      dispatch(
        setCredentials({
          token:
            session.token,

          employee:
            session.employee,
        })
      );

      clearImpersonationSession();

      window.location.href =
        "/employees";
    };

  return (
    <div className="flex flex-col gap-3 border-b border-amber-300 bg-amber-100 px-4 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-200 p-2">
          <ShieldCheck
            size={18}
          />
        </div>

        <div>
          <p className="text-sm font-semibold">
            Admin impersonation active
          </p>

          <p className="text-xs text-amber-800">
            Viewing CRM as{" "}
            <span className="font-semibold">
              {employee.name}
            </span>
            {" • "}
            {
              employee.employeeCode
            }
            {" • "}
            {
              employee.role
            }
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={
          returnToAdmin
        }
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-950"
      >
        <LogOut
          size={16}
        />
        Return to Admin
      </button>
    </div>
  );
}
