import { FolderKanban, MessageSquare, Clock, ArrowUpRight } from "lucide-react";

const metrics = [
  { label: "Active Projects", value: "12", icon: FolderKanban, change: "+2 this week" },
  { label: "Unread Messages", value: "8", icon: MessageSquare, change: "3 urgent" },
];

const activities = [
  { time: "2 min ago", text: "Sarah pushed new designs for Acme Corp website", type: "update" as const },
  { time: "1 hr ago", text: "Client approved Phase 2 deliverables for TechStart", type: "approval" as const },
  { time: "3 hrs ago", text: "New message from CloudNine Inc. regarding API integration", type: "message" as const },
  { time: "5 hrs ago", text: "Sprint review completed for Project Aurora", type: "update" as const },
  { time: "Yesterday", text: "Milestone reached: Beta launch for HealthTrack app", type: "approval" as const },
  { time: "Yesterday", text: "Alex added 3 new tasks to the Finova dashboard project", type: "update" as const },
];

export default function Dashboard() {
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
        <div className="space-y-0">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-4 py-3 group">
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
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
