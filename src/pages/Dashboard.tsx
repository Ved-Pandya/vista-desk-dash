// src/pages/Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, MessageSquare, Clock, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns"; // already in your package.json

export default function Dashboard() {
  // Fetch active projects count
  const { data: projectCount } = useQuery({
    queryKey: ["active-projects"],
    queryFn: async () => {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count || 0;
    },
  });

  // Fetch real activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const metrics = [
    { label: "Active Projects", value: projectCount?.toString() || "0", icon: FolderKanban, change: "Current workload" },
    // Placeholder for messages until we build the messaging tables
    { label: "Unread Messages", value: "0", icon: MessageSquare, change: "Requires attention" }, 
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your agency operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="glass-card p-5 group hover:border-accent/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="text-3xl font-bold mt-1">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{m.change}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                <m.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors">
            View all <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-accent/10 rounded" />)}
          </div>
        ) : (
          <div className="space-y-0">
            {activities?.map((a, i) => (
              <div key={a.id} className="flex gap-4 py-3 group">
                <div className="flex flex-col items-center">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    a.type === "approval" ? "bg-success" : a.type === "message" ? "bg-primary" : "bg-accent"
                  }`} />
                  {i < activities.length - 1 && <div className="w-px flex-1 bg-border/50 mt-1" />}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm">{a.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {activities?.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}