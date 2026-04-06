import { LayoutDashboard, FolderKanban, MessageSquare, Users, Settings, LogOut } from "lucide-react";
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
  { title: "Client Portal", url: "/client-portal", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

const clientNav = [
  { title: "My Project", url: "/client-portal", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === "client" ? clientNav : agencyNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-6 flex flex-col h-full">
        <div className="px-4 mb-8">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              <span className="text-accent">◆</span> AgencyOS
            </h1>
          ) : (
            <span className="text-accent text-xl font-bold">◆</span>
          )}
        </div>
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/80 transition-colors"
                      activeClassName="bg-sidebar-accent text-accent font-medium"
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
