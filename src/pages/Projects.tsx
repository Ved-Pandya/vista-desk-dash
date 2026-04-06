import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Code2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Priority = "high" | "medium" | "low";
type Column = "todo" | "progress" | "review" | "done";

interface Task {
  id: string;
  title: string;
  assignee: string;
  initials: string;
  priority: Priority;
  column: Column;
  techStack: string[];
  deadline: string;
  description: string;
  progress: number;
}

const tasks: Task[] = [
  { id: "1", title: "Acme Corp Landing Page", assignee: "Sarah K.", initials: "SK", priority: "high", column: "progress", techStack: ["React", "Tailwind", "Framer Motion"], deadline: "Apr 15, 2026", description: "Complete redesign of corporate landing page with animated hero section and interactive product showcase.", progress: 60 },
  { id: "2", title: "CloudNine API Integration", assignee: "Alex M.", initials: "AM", priority: "high", column: "review", techStack: ["Node.js", "PostgreSQL", "Redis"], deadline: "Apr 10, 2026", description: "RESTful API integration for real-time data synchronization with third-party cloud services.", progress: 85 },
  { id: "3", title: "TechStart Mobile App", assignee: "Jamie L.", initials: "JL", priority: "medium", column: "todo", techStack: ["React Native", "Firebase"], deadline: "May 1, 2026", description: "Cross-platform mobile application for startup management and team collaboration.", progress: 10 },
  { id: "4", title: "Finova Dashboard", assignee: "Chris P.", initials: "CP", priority: "low", column: "todo", techStack: ["React", "D3.js", "Supabase"], deadline: "May 20, 2026", description: "Financial analytics dashboard with interactive charts and real-time market data.", progress: 5 },
  { id: "5", title: "HealthTrack Beta", assignee: "Morgan R.", initials: "MR", priority: "medium", column: "done", techStack: ["Next.js", "Prisma", "Stripe"], deadline: "Apr 5, 2026", description: "Health monitoring platform with subscription billing and user analytics.", progress: 100 },
  { id: "6", title: "Project Aurora UI Kit", assignee: "Sarah K.", initials: "SK", priority: "low", column: "progress", techStack: ["Figma", "Storybook", "React"], deadline: "Apr 25, 2026", description: "Comprehensive design system and component library for internal use.", progress: 40 },
];

const columns: { key: Column; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "bg-muted-foreground" },
  { key: "progress", label: "In Progress", color: "bg-primary" },
  { key: "review", label: "Client Review", color: "bg-accent" },
  { key: "done", label: "Done", color: "bg-success" },
];

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/20",
  medium: "bg-accent/15 text-accent border-accent/20",
  low: "bg-muted text-muted-foreground border-border",
};

export default function Projects() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and track project progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 overflow-x-auto">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.key);
          return (
            <div key={col.key} className="min-w-[260px]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold tracking-wide">{col.label}</span>
                <span className="text-xs text-muted-foreground ml-auto bg-secondary/60 rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div className="space-y-3">
                {colTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="glass-card p-4 w-full text-left hover:border-accent/40 transition-all group"
                  >
                    <p className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{task.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">Progress</span>
                        <span className="text-[10px] text-muted-foreground">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-1" />
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/15 text-primary">{task.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="bg-card border-border">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedTask.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedTask.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">{selectedTask.deadline}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Overall Progress</span>
                    <span className="text-xs font-medium text-accent">{selectedTask.progress}%</span>
                  </div>
                  <Progress value={selectedTask.progress} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] bg-primary/15 text-primary">{selectedTask.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedTask.assignee}</span>
                  <Badge variant="outline" className={`ml-auto text-[10px] px-2 py-0.5 ${priorityStyles[selectedTask.priority]}`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2.5">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground font-medium">Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs px-2.5 py-0.5">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
