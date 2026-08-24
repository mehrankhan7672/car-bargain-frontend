// src/components/settings/StaffTab.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus, Shield, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { staffService } from "../services/staffService";
import { useAuth, type UserPermissions } from "@/contexts/AuthContext";

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  isActive: boolean;
  permissions: UserPermissions;
};

const emptyPermissions: UserPermissions = {
  canView: true,
  canAdd: true,
  canEdit: true,
  canDelete: false,
};

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string }[] = [
  { key: "canView", label: "View records" },
  { key: "canAdd", label: "Add records" },
  { key: "canEdit", label: "Edit records" },
  { key: "canDelete", label: "Delete records" },
];

function AddStaffDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<UserPermissions>(emptyPermissions);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPermissions(emptyPermissions);
  };

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      toast.error("Name, email and password are all required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      await staffService.create({ name, email, password, permissions });
      toast.success("Staff account created", { description: `${name} can now log in.` });
      reset();
      setOpen(false);
      onCreated();
    } catch (err: any) {
      toast.error("Failed to create staff account", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Button className="rounded-xl" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Add Staff
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Staff Account</DialogTitle>
          <DialogDescription>
            They'll log in with this email and password, and share your dealership's data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed Raza"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-10 rounded-lg"
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Permissions
            </Label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3">
              {PERMISSION_LABELS.map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={permissions[p.key]}
                    onCheckedChange={(checked) =>
                      setPermissions((prev) => ({ ...prev, [p.key]: !!checked }))
                    }
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Staff Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPermissionsDialog({
  staff,
  open,
  onOpenChange,
  onSaved,
}: {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [permissions, setPermissions] = useState<UserPermissions>(emptyPermissions);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (staff) setPermissions(staff.permissions);
  }, [staff]);

  if (!staff) return null;

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await staffService.update(staff._id, { permissions });
      toast.success("Permissions updated", { description: `${staff.name}'s access was changed.` });
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast.error("Failed to update permissions", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Permissions</DialogTitle>
          <DialogDescription>
            {staff.name} · {staff.email}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3">
          {PERMISSION_LABELS.map((p) => (
            <label key={p.key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={permissions[p.key]}
                onCheckedChange={(checked) =>
                  setPermissions((prev) => ({ ...prev, [p.key]: !!checked }))
                }
              />
              {p.label}
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={handleSave} disabled={submitting}>
            {submitting ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StaffTab() {
  const { isOwner } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Fetch all staff accounts (backend already scopes to your tenant)
  const load = () => {
    setLoading(true);
    staffService
      .getAll()
      .then((res) => {
        setStaff(res?.staff || []);
      })
      .catch((err) => {
        console.error("Failed to load staff:", err);
        toast.error("Failed to load staff accounts", { description: err.message });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Permanently delete a staff account (calls DELETE /auth/staff/:id)
  const removeStaff = async (member: StaffMember) => {
    try {
      await staffService.remove(member._id);
      toast.success("Staff account deleted", {
        description: `${member.name} has been permanently removed.`,
      });
      load();
    } catch (err: any) {
      toast.error("Failed to delete staff account", { description: err.message });
    }
  };

  if (!isOwner) {
    return (
      <div className="card-soft p-6 text-sm text-muted-foreground">
        Only the account owner can manage staff and permissions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Staff accounts share your dealership's data — Cars, Dealers, Exchanges and everything else
          — scoped by the permissions you set below.
        </p>
        <AddStaffDialog onCreated={load} />
      </div>

      <div className="card-soft overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No staff accounts yet — add one to share access with your team.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {PERMISSION_LABELS.filter((p) => member.permissions?.[p.key]).map((p) => (
                        <Badge key={p.key} variant="secondary" className="text-xs">
                          {p.label.replace(" records", "")}
                        </Badge>
                      ))}
                      {PERMISSION_LABELS.every((p) => !member.permissions?.[p.key]) && (
                        <Badge variant="outline" className="text-xs">
                          No access
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "default" : "destructive"}>
                      {member.isActive ? "Active" : "Deactivated"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-lg"
                        aria-label="Edit permissions"
                        onClick={() => setEditingStaff(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Delete button – calls hard delete API */}
                      <ConfirmDelete itemName={member.name} onConfirm={() => removeStaff(member)}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-lg text-destructive"
                          aria-label="Delete staff"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmDelete>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditPermissionsDialog
        staff={editingStaff}
        open={!!editingStaff}
        onOpenChange={(open) => !open && setEditingStaff(null)}
        onSaved={load}
      />
    </div>
  );
}
