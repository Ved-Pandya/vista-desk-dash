import { LayoutDashboard, FolderKanban, MessageSquare, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const agencyNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-6 flex flex-col h-full">
        {/* BRANDING AREA - Updated for BodhiX */}
        <div className="px-4 mb-6 flex items-center gap-3">
          <img 
            src="/bx-logo.png" 
            alt="BodhiX" 
            className={`object-contain transition-all duration-300 ${collapsed ? 'h-8 w-8 mx-auto' : 'h-7 w-7'}`} 
          />
          {!collapsed && (
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              BodhiX
            </h1>
          )}
        </div>



        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {agencyNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/80 transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-3 border-t border-sidebar-border">
          <SidebarMenuButton onClick={handleLogout} className="w-full hover:bg-sidebar-accent/80 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}