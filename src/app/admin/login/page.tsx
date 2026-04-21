import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Suspense fallback={<div className="text-muted-foreground">טוען…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
