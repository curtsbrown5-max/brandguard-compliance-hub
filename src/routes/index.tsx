import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    import("@/integrations/supabase/client").then(async ({ supabase }) => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      navigate({ to: data.user ? "/dashboard" : "/auth", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);
  return null;
}
