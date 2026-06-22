import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export type LocationScores = {
  name: string;
  signage: number;
  cleanliness: number;
  color_compliance: number;
  merchandising: number;
  safety: number;
};

const CATEGORIES: Array<{ key: keyof Omit<LocationScores, "name">; label: string }> = [
  { key: "signage", label: "Signage" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "color_compliance", label: "Color Compliance" },
  { key: "merchandising", label: "Merchandising" },
  { key: "safety", label: "Safety" },
];

const empty: LocationScores = {
  name: "", signage: 0, cleanliness: 0, color_compliance: 0, merchandising: 0, safety: 0,
};

export function LocationFormDialog({
  open, onOpenChange, initial, onSubmit, mode,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: LocationScores;
  onSubmit: (values: LocationScores) => Promise<void> | void;
  mode: "create" | "edit";
}) {
  const [values, setValues] = useState<LocationScores>(initial ?? empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValues(initial ?? empty);
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Location" : "Edit Location"}</DialogTitle>
          <DialogDescription>Enter the name and category scores (0–100).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Location name</Label>
            <Input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Store #4127 – Lakewood NJ"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <div key={c.key} className="space-y-2">
                <Label>{c.label}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={values[c.key]}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [c.key]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                    }))
                  }
                  required
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
