import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 bg-card/30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients..."
            className="pl-9 bg-secondary/50 border-border/50 text-sm h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            3
          </Badge>
        </button>
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
