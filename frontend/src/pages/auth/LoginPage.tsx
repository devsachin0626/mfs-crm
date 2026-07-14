import { Card, Input, Button } from "../../components/ui";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card>
        <div className="w-95">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700">
              MFS CRM
            </h1>

            <p className="mt-2 text-gray-600">
              Mahakal Financial Services
            </p>

            <p className="text-sm text-gray-500">
              Employee Login
            </p>
          </div>

          <div className="space-y-4">
            <Input placeholder="Employee ID" />

            <Input
              type="password"
              placeholder="Password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember Me
              </label>

              <button className="text-blue-700 hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button type="submit">
              Login
            </Button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            Version 1.0
            <br />
            © Mahakal Financial Services
          </div>
        </div>
      </Card>
    </div>
  );
}