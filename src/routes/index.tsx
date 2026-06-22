import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthReady } from "@/hooks/use-auth-ready";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user, isReady } = useAuthReady();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady) return;
    navigate({ to: user ? "/dashboard" : "/auth", replace: true });
  }, [isReady, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}
