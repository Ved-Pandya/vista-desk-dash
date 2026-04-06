import { Download, CheckCircle2, Clock, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const deliverables = [
  { name: "Homepage Design v3.pdf", status: "approved" as const, date: "Apr 2, 2026" },
  { name: "API Documentation.md", status: "pending" as const, date: "Apr 4, 2026" },
  { name: "Mobile Wireframes.fig", status: "pending" as const, date: "Apr 5, 2026" },
  { name: "Brand Guidelines.pdf", status: "approved" as const, date: "Mar 28, 2026" },
];

const milestones = [
  { name: "Discovery & Planning", progress: 100 },
  { name: "Design Phase", progress: 100 },
  { name: "Development Sprint 1", progress: 75 },
  { name: "Client Review", progress: 20 },
  { name: "Final Delivery", progress: 0 },
];

const chatMessages = [
  { sender: "agency" as const, text: "Hi! Your project is progressing well. Sprint 1 is nearly done.", time: "Yesterday" },
  { sender: "client" as const, text: "Great! When can I see the staging preview?", time: "Yesterday" },
  { sender: "agency" as const, text: "We'll have it ready by end of this week. Stay tuned!", time: "Today" },
];

export default function ClientPortal() {
  const [msg, setMsg] = useState("");
  const overallProgress = Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your project progress and deliverables</p>
      </div>

      {/* Overall Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Project Timeline</h2>
          <span className="text-sm font-medium text-primary">{overallProgress}% Complete</span>
        </div>
        <Progress value={overallProgress} className="h-3 mb-6" />
        <div className="space-y-3">
          {milestones.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                m.progress === 100 ? "bg-success" : m.progress > 0 ? "bg-primary" : "bg-muted-foreground/30"
              }`} />
              <span className="text-sm flex-1">{m.name}</span>
              <span className="text-xs text-muted-foreground w-12 text-right">{m.progress}%</span>
              <Progress value={m.progress} className="h-1.5 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliverables */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Deliverables</h2>
          <div className="space-y-3">
            {deliverables.map((d) => (
              <div key={d.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.date}</p>
                </div>
                {d.status === "approved" ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Approved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs gap-1">
                    <Clock className="h-3 w-3" /> Pending
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Widget */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Chat with Agency</h2>
          </div>
          <div className="flex-1 space-y-3 mb-4 min-h-[200px]">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  m.sender === "client" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  <p className="text-sm">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${
                    m.sender === "client" ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a message..."
              className="bg-secondary/50 border-border/50 text-sm"
            />
            <Button size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
