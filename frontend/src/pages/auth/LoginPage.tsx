import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { Card, Input, Button } from "../../components/ui";

import { login } from "../../services/auth.service";
import { useAppDispatch } from "../../hooks/redux";
import { setCredentials } from "../../store/slices/authSlice";
import { setToken } from "../../utils/auth";
import {
  getBrandSettings,
} from "../../services/settings.service";

const DEFAULT_CRM_NAME =
  "MFS CRM";

const DEFAULT_COMPANY_NAME =
  "Mahakal Financial Services";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [brand, setBrand] =
    useState({
      crmDisplayName:
        DEFAULT_CRM_NAME,
      companyName:
        DEFAULT_COMPANY_NAME,
    });

  useEffect(() => {
    const loadBrand = async () => {
      try {
        const response =
          await getBrandSettings();

        setBrand({
          crmDisplayName:
            response.brand
              .crmDisplayName ||
            DEFAULT_CRM_NAME,
          companyName:
            response.brand
              .companyName ||
            DEFAULT_COMPANY_NAME,
        });
      } catch {
        // Safe defaults keep login available if branding fails.
      }
    };

    void loadBrand();
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!employeeCode.trim()) {
      setError("Employee Code is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        employeeCode: employeeCode.trim(),
        password,
      });

  

      if (!response.success) {
        setError(response.message || "Login failed");
        return;
      }

      // Save JWT token in localStorage
      setToken(response.token);

      // Save authentication data in Redux
      dispatch(
        setCredentials({
          token: response.token,
          employee: response.employee,
        })
      );

      // Go to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Invalid Employee Code or Password";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card>
        <div className="w-95">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700">
              {brand.crmDisplayName}
            </h1>

            <p className="mt-2 text-gray-600">
              {brand.companyName}
            </p>

            <p className="text-sm text-gray-500">
              Employee Login
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Employee Code */}
            <Input
              placeholder="Employee ID"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              disabled={loading}
            />

            {/* Password */}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {/* Error */}
            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Remember + Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={loading}
                />

                <span>Remember Me</span>
              </label>

              <button
                type="button"
                className="text-blue-700 hover:underline"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            Version 1.0
            <br />
            © {brand.companyName}
          </div>
        </div>
      </Card>
    </div>
  );
}
