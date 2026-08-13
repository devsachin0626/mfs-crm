import { useLogout } from "../../hooks/useLogout";

export default function LogoutButton() {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      Logout
    </button>
  );
}