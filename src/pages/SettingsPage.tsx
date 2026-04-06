import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your agency preferences</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Agency Name</Label>
            <Input defaultValue="AgencyOS" className="bg-secondary/50 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Email</Label>
            <Input defaultValue="team@agencyos.dev" className="bg-secondary/50 border-border/50" />
          </div>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
      </div>
    </div>
  );
}
