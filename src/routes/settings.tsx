import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Car Bargain Manager" },
      { name: "description", content: "Update business information, logo, contact details, password and theme." },
      { property: "og:title", content: "Settings — Car Bargain Manager" },
      { property: "og:description", content: "Business profile and app preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { dark, setDark } = useTheme();
  const save = () => toast.success("Settings saved", { description: "Demo mode — nothing is stored." });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Settings" subtitle="Business profile and app preferences" />
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="security">Password</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

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
              <Button className="rounded-xl" onClick={save}>
                Save Profile
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <div className="card-soft grid gap-5 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
              <Logo size="lg" tone="dark" />
              <Button variant="outline" className="rounded-xl" onClick={save}>
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
              <Button className="rounded-xl" onClick={save}>
                Save Business Info
              </Button>
            </div>
          </div>
        </TabsContent>

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
              <Button className="rounded-xl" onClick={save}>
                Update Password
              </Button>
            </div>
          </div>
        </TabsContent>

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
