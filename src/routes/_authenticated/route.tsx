import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthReady } from "@/hooks/use-auth-ready";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isReady } = useAuthReady();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && !user) navigate({ to: "/auth", replace: true });
  }, [isReady, user, navigate]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <Outlet />;
}
