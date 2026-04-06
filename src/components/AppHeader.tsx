import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "./GlobalSearch"; 

export function AppHeader() {
  return (
    // FIX: Added 'z-50 relative' to the header so it sits above all page content
    <header className="relative z-50 h-14 flex items-center justify-between border-b border-border/50 px-4 bg-card/30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        
        <div className="w-72 relative"> 
          <GlobalSearch />
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
            VP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}