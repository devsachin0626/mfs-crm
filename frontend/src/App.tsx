import AppRoutes from "./routes/AppRoutes";

import AuthInitializer from "./components/auth/AuthInitializer";

export default function App() {
  return (
    <AuthInitializer>
      <AppRoutes />
    </AuthInitializer>
  );
}