import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getServerAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <LoginForm />
      <p className="text-center text-xs text-zinc-500">
        By signing in you agree to our terms and acknowledge that generation counts reset monthly.
      </p>
    </div>
  );
}
