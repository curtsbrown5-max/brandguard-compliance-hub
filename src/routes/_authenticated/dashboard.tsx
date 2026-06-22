import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { LocationFormDialog, type LocationScores } from "@/components/LocationFormDialog";
import { posthog } from "@/lib/posthog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Location = LocationScores & { id: string };

const CATEGORY_LABELS: Array<[keyof Omit<LocationScores, "name">, string]> = [
  ["signage", "Signage"],
  ["cleanliness", "Cleanliness"],
  ["color_compliance", "Color"],
  ["merchandising", "Merch"],
  ["safety", "Safety"],
];

function overall(l: LocationScores) {
  return Math.round(
    (l.signage + l.cleanliness + l.color_compliance + l.merchandising + l.safety) / 5,
  );
}

function scoreColor(n: number) {
  if (n >= 85) return "text-emerald-600";
  if (n >= 70) return "text-amber-600";
  return "text-rose-600";
}

function Dashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState<Location | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("locations")
      .select("id, name, signage, cleanliness, color_compliance, merchandising, safety")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLocations(data as Location[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (values: LocationScores) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("locations")
      .insert({ ...values, user_id: userData.user.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    posthog.capture("audit_logged", { location_name: values.name });
    toast.success("Location added");
    setCreateOpen(false);
    load();
  };

  const handleUpdate = async (values: LocationScores) => {
    if (!editing) return;
    const { error } = await supabase.from("locations").update(values).eq("id", editing.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Location updated");
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("locations").delete().eq("id", deleting.id);
    if (error) return toast.error(error.message);
    toast.success("Location deleted");
    setDeleting(null);
    load();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header showLogout />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Locations</h1>
            <p className="text-sm text-muted-foreground">
              Brand-compliance audits across your franchise.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Location
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : locations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">No locations yet.</p>
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add your first location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((l) => {
              const score = overall(l);
              return (
                <Card key={l.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{l.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between rounded-lg bg-muted/60 px-4 py-3">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Overall Compliance
                      </span>
                      <span className={`text-3xl font-bold ${scoreColor(score)}`}>
                        {score}
                        <span className="text-base text-muted-foreground">/100</span>
                      </span>
                    </div>
                    <dl className="space-y-1.5 text-sm">
                      {CATEGORY_LABELS.map(([key, label]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className={`font-medium ${scoreColor(l[key])}`}>{l[key]}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditing(l)}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(l)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <LocationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
      />
      <LocationFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        initial={editing ?? undefined}
        onSubmit={handleUpdate}
      />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{deleting?.name}”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
