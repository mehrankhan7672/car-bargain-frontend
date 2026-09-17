import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Logo } from "@/components/brand/Logo";
import { useTheme } from "@/components/layout/Topbar";
import { business } from "@/data/dummy";
import { useAuth } from "@/contexts/AuthContext";
import {
  Trash2,
  Pencil,
  Search,
  Loader2,
  Eye,
  Plus,
  PenLine,
  Trash,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import staffService from "@/services/staffService";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Car Bargain Manager" },
      {
        name: "description",
        content: "Update business information, logo, contact details, password and theme.",
      },
    ],
  }),
  component: Settings,
});

// 🚫 Dashboard removed
const MODULES = [
  { key: "cars", label: "Cars" },
  { key: "sales", label: "Sales" },
  { key: "exchanges", label: "Exchanges" },
  { key: "dealers", label: "Dealers" },
  { key: "expenses", label: "Expenses" },
  { key: "employees", label: "Employees" },
  { key: "salaries", label: "Salaries" },
] as const;

type ModuleKey = (typeof MODULES)[number]["key"];

type Permission = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<ModuleKey, Permission>;
  isActive: boolean;
};

const getEmptyPermissions = (): Record<ModuleKey, Permission> => {
  return MODULES.reduce(
    (acc, mod) => {
      acc[mod.key] = { view: false, add: false, edit: false, delete: false };
      return acc;
    },
    {} as Record<ModuleKey, Permission>,
  );
};

const normalizePermissions = (perms: any): Record<ModuleKey, Permission> => {
  const base = getEmptyPermissions();
  if (!perms) return base;
  MODULES.forEach((mod) => {
    if (perms[mod.key]) {
      base[mod.key] = {
        view: !!perms[mod.key].view,
        add: !!perms[mod.key].add,
        edit: !!perms[mod.key].edit,
        delete: !!perms[mod.key].delete,
      };
    }
  });
  return base;
};

// Icon + label per action type
const ACTION_CONFIG = {
  view: { icon: Eye, label: "View" },
  add: { icon: Plus, label: "Add" },
  edit: { icon: PenLine, label: "Edit" },
  delete: { icon: Trash, label: "Del" },
} as const;

// Helper: count total granted permissions for a user
const countPermissions = (perms: Record<ModuleKey, Permission>) => {
  let count = 0;
  MODULES.forEach((mod) => {
    const p = perms[mod.key];
    if (p.view) count++;
    if (p.add) count++;
    if (p.edit) count++;
    if (p.delete) count++;
  });
  return count;
};

function Settings() {
  const { dark, setDark } = useTheme();
  const { isOwner } = useAuth();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔽 Track which user IDs are expanded
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOwner) {
      fetchStaff();
    }
  }, [isOwner]);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await staffService.getAll();
      const staffArray = (data.staff || []).map((s: any) => ({
        ...s,
        permissions: normalizePermissions(s.permissions),
      }));
      setStaffList(staffArray);
    } catch (error: any) {
      console.error("Fetch staff error:", error);
      toast.error(error.response?.data?.message || "Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCreateOrUpdateUser = async () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error("Please fill in Name and Email");
      return;
    }
    if (!editingUser && !newStaff.password) {
      toast.error("Password is required for new staff members");
      return;
    }
    if (!editingUser && newStaff.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        const payload: any = {
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
        };

        const result = await staffService.update(editingUser._id, payload);

        setStaffList((prev) =>
          prev.map((s) =>
            s._id === editingUser._id
              ? {
                  ...s,
                  name: result.user.name,
                  email: result.user.email,
                  role: result.user.role,
                }
              : s,
          ),
        );

        toast.success("User updated successfully");
        setEditingUser(null);
      } else {
        const payload = {
          name: newStaff.name,
          email: newStaff.email,
          password: newStaff.password,
          role: newStaff.role,
        };

        const result = await staffService.create(payload);

        const newMember: StaffMember = {
          ...result.user,
          permissions: normalizePermissions(result.user.permissions),
        };

        setStaffList((prev) => [newMember, ...prev]);

        // Auto-expand the newly created user's permissions
        setExpandedUsers((prev) => ({ ...prev, [newMember._id]: true }));

        toast.success("User created successfully. Assign permissions below.");
      }

      setNewStaff({ name: "", email: "", password: "", role: "staff" });
    } catch (error: any) {
      console.error("Save staff error:", error);
      toast.error(error.response?.data?.message || "Failed to save user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (staff: StaffMember) => {
    setEditingUser(staff);
    setNewStaff({
      name: staff.name,
      email: staff.email,
      password: "",
      role: staff.role,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await staffService.remove(id);
      setStaffList((prev) => prev.filter((s) => s._id !== id));
      if (editingUser?._id === id) {
        setEditingUser(null);
        setNewStaff({ name: "", email: "", password: "", role: "staff" });
      }
      toast.success("User deleted");
    } catch (error: any) {
      console.error("Delete staff error:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const togglePermission = (userId: string, moduleKey: ModuleKey, type: keyof Permission) => {
    setStaffList((prev) =>
      prev.map((staff) => {
        if (staff._id !== userId) return staff;

        const updatedPermissions = { ...staff.permissions };

        updatedPermissions[moduleKey] = {
          ...updatedPermissions[moduleKey],
          [type]: !updatedPermissions[moduleKey][type],
        };

        // 🔗 Cars → View auto-enables Dealers → View
        if (moduleKey === "cars" && type === "view" && updatedPermissions.cars.view) {
          if (!updatedPermissions.dealers.view) {
            updatedPermissions.dealers = {
              ...updatedPermissions.dealers,
              view: true,
            };
            toast.info("Dealers → View auto-enabled", {
              description: "Required dependency for viewing Cars.",
            });
          }
        }

        return {
          ...staff,
          permissions: updatedPermissions,
        };
      }),
    );
  };

  const handleSavePermissions = async (staff: StaffMember) => {
    try {
      const result = await staffService.update(staff._id, {
        permissions: staff.permissions,
      });

      setStaffList((prev) =>
        prev.map((s) =>
          s._id === staff._id
            ? { ...s, permissions: normalizePermissions(result.user.permissions) }
            : s,
        ),
      );

      toast.success(`Permissions saved for ${staff.name.split(" ")[0]}`);
    } catch (error: any) {
      console.error("Save permissions error:", error);
      toast.error(error.response?.data?.message || "Failed to save permissions");
    }
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Settings" subtitle="Business profile and app preferences" />
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="security">Password</TabsTrigger>
          {isOwner && <TabsTrigger value="staff">Staff & Permissions</TabsTrigger>}
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        {/* ---- PROFILE TAB ---- */}
        <TabsContent value="profile">
          <div className="card-soft grid gap-5 p-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Your Name</Label>
              <Input defaultValue="Ahmed Raza" className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input defaultValue={business.email} className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input defaultValue={business.phone} className="h-11 rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <Button
                className="rounded-xl"
                onClick={() =>
                  toast.success("Settings saved", {
                    description: "Demo mode — nothing is stored.",
                  })
                }
              >
                Save Profile
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---- BUSINESS TAB ---- */}
        <TabsContent value="business">
          <div className="card-soft grid gap-5 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
              <Logo size="lg" tone="dark" />
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  toast.success("Settings saved", {
                    description: "Demo mode — nothing is stored.",
                  })
                }
              >
                Change Logo
              </Button>
            </div>
            <div className="grid gap-2">
              <Label>Business Name</Label>
              <Input defaultValue={business.name} className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Business Email</Label>
              <Input defaultValue={business.email} className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Business Phone</Label>
              <Input defaultValue={business.phone} className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input defaultValue={business.address} className="h-11 rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <Button
                className="rounded-xl"
                onClick={() =>
                  toast.success("Settings saved", {
                    description: "Demo mode — nothing is stored.",
                  })
                }
              >
                Save Business Info
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---- SECURITY TAB ---- */}
        <TabsContent value="security">
          <div className="card-soft grid gap-5 p-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" className="h-11 rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <Button
                className="rounded-xl"
                onClick={() =>
                  toast.success("Settings saved", {
                    description: "Demo mode — nothing is stored.",
                  })
                }
              >
                Update Password
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---- STAFF & PERMISSIONS TAB ---- */}
        {isOwner && (
          <TabsContent value="staff" className="space-y-6">
            {/* 1. CREATE / EDIT USER FORM */}
            <div className="card-soft p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingUser ? "Edit User Details" : "Create New User"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="john@example.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Password{" "}
                    {editingUser && (
                      <span className="text-xs text-muted-foreground">(leave blank to keep)</span>
                    )}
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                {editingUser && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setEditingUser(null);
                      setNewStaff({
                        name: "",
                        email: "",
                        password: "",
                        role: "staff",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  className="rounded-xl"
                  onClick={handleCreateOrUpdateUser}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : editingUser ? (
                    "Update User"
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </div>

            {/* 2. USER PERMISSIONS LIST */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <h3 className="text-lg font-semibold">User Permissions</h3>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="card-soft p-8 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading staff...
                </div>
              ) : staffList.length === 0 ? (
                <div className="card-soft p-8 text-center text-muted-foreground border-dashed border-2">
                  No users created yet. Fill the form above to create one and assign permissions.
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="card-soft p-8 text-center text-muted-foreground border-dashed border-2">
                  No users found matching "{searchQuery}". Try a different search.
                </div>
              ) : (
                filteredStaff.map((staff) => {
                  const isExpanded = !!expandedUsers[staff._id];
                  const totalPerms = countPermissions(staff.permissions);

                  return (
                    <div
                      key={staff._id}
                      className="card-soft border border-border overflow-hidden"
                    >
                      {/* User Header — clickable to expand */}
                      <div
                        className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(staff._id)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Chevron to indicate expand/collapse */}
                          <div className="text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>

                          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {staff.name}{" "}
                              <span className="text-xs font-normal text-muted-foreground ml-1">
                                ({staff.role})
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {staff.email}
                              <span className="mx-1.5">•</span>
                              <span className="text-primary/80 font-medium">
                                {totalPerms} permission{totalPerms !== 1 ? "s" : ""} granted
                              </span>
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex gap-2"
                          onClick={(e) => e.stopPropagation()} // Prevent expand when clicking Edit/Delete
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-lg text-xs"
                            onClick={() => handleEditClick(staff)}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-lg text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleDeleteUser(staff._id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>

                      {/* COLLAPSIBLE PERMISSIONS SECTION */}
                      {isExpanded && (
                        <>
                          <div className="p-3 bg-background border-t border-border">
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {MODULES.map((mod) => (
                                <div
                                  key={mod.key}
                                  className="rounded-lg border border-border bg-card p-2.5"
                                >
                                  <p className="font-semibold text-xs mb-2 text-foreground">
                                    {mod.label}
                                  </p>

                                  <div className="grid grid-cols-4 gap-1">
                                    {(["view", "add", "edit", "delete"] as const).map(
                                      (type) => {
                                        const isActive = staff.permissions[mod.key][type];
                                        const { icon: Icon, label } = ACTION_CONFIG[type];
                                        return (
                                          <button
                                            key={type}
                                            onClick={() =>
                                              togglePermission(staff._id, mod.key, type)
                                            }
                                            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                                              isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                            }`}
                                          >
                                            <Icon className="h-3.5 w-3.5" />
                                            <span>{label}</span>
                                          </button>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Save Footer */}
                          <div className="px-3 py-2 border-t border-border bg-muted/10 flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              Toggle permissions per module, then save.
                            </p>
                            <Button
                              size="sm"
                              className="rounded-lg text-xs h-8"
                              onClick={() => handleSavePermissions(staff)}
                            >
                              Save Permissions
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        )}

        {/* ---- THEME TAB ---- */}
        <TabsContent value="theme">
          <div className="card-soft flex items-center justify-between gap-4 p-6">
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Easy on the eyes at night.</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}