import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Plus, MoreVertical, Clock, AlertCircle, FolderPlus, Play, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Types - Updated to 3 stages
type TaskStatus = "todo" | "in_progress" | "done";
type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  project_id: string;
};

// Removed the "Review" column
const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Completed" },
];

export default function Projects() {
  const queryClient = useQueryClient();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form States
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    projectId: "",
  });
  const [newProject, setNewProject] = useState({
    title: "",
    clientId: "",
  });

  // --- QUERIES ---

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, title");
      if (error) throw error;
      return data;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company_name")
        .eq("role", "client");
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  useEffect(() => {
    if (projects.length > 0 && !newTask.projectId) {
      setNewTask((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [projects]);

  useEffect(() => {
    if (clients.length > 0 && !newProject.clientId) {
      setNewProject((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients]);

  // --- MUTATIONS ---

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert([
        {
          title: newProject.title,
          client_id: newProject.clientId || null,
          status: "active",
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects-list"] });
      toast.success("Project created successfully!");
      setIsProjectModalOpen(false);
      setNewProject({ title: "", clientId: clients[0]?.id || "" });
    },
    onError: (error: any) => toast.error(`Failed to create project: ${error.message}`),
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert([
        {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          project_id: newTask.projectId || null,
          status: "todo",
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
      setIsTaskModalOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", projectId: projects[0]?.id || "" });
    },
    onError: (error: any) => toast.error(`Failed to create task: ${error.message}`),
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      // Give appropriate feedback based on the new status
      if (variables.newStatus === 'in_progress') toast.success("Started working on task");
      if (variables.newStatus === 'done') toast.success("Task marked as completed!");
      if (variables.newStatus === 'todo') toast.success("Task moved back to To Do");
      
      setSelectedTask(null); // Close the detail modal after action
    },
    onError: (error: any) => toast.error(`Failed to update task: ${error.message}`),
  });

  // --- HANDLERS ---

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== status) {
      updateTaskStatus.mutate({ taskId: draggedTaskId, newStatus: status });
    }
    setDraggedTaskId(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return toast.error("Task title is required");
    createTaskMutation.mutate();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return toast.error("Project title is required");
    createProjectMutation.mutate();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading board...</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your active tasks and progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 border border-border/50 bg-background hover:bg-accent/10"
          >
            <FolderPlus className="h-4 w-4" /> New Project
          </Button>
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Kanban Grid - Updated to md:grid-cols-3 for wider columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start min-h-[500px]">
        {COLUMNS.map((column) => (
          <div 
            key={column.id}
            className="flex flex-col bg-accent/5 rounded-xl border border-border/50 p-4 min-h-[500px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                {column.label}
                <span className="bg-background text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-border/50">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </h3>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {tasks
                .filter((task) => task.status === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTask(task)}
                    className="glass-card p-4 rounded-lg cursor-pointer border border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-background"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className={`text-[10px] px-2 py-1 rounded border font-medium flex items-center gap-1 ${
                        task.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        task.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-success/10 text-success border-success/20'
                      }`}>
                        {task.priority === 'high' && <AlertCircle className="h-3 w-3" />}
                        {task.priority.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* TASK DETAILS & WORKFLOW MODAL */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                selectedTask?.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                selectedTask?.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                'bg-success/10 text-success border-success/20'
              }`}>
                {selectedTask?.priority.toUpperCase()}
              </span>
              Task Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6 mt-2">
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-accent/5 p-4 rounded-lg border border-border/50">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Current Status:</span> 
                {COLUMNS.find(c => c.id === selectedTask.status)?.label}
              </div>

              {/* Workflow Action Buttons - Simplified for Solo Dev */}
              <div className="pt-4 border-t border-border/50 flex gap-3">
                
                {/* Flow 1: Task is in To Do */}
                {selectedTask.status === 'todo' && (
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => updateTaskStatus.mutate({ taskId: selectedTask.id, newStatus: "in_progress" })}
                    disabled={updateTaskStatus.isPending}
                  >
                    <Play className="h-4 w-4" /> Start Working
                  </Button>
                )}

                {/* Flow 2: Task is In Progress */}
                {selectedTask.status === 'in_progress' && (
                  <>
                    <Button 
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => updateTaskStatus.mutate({ taskId: selectedTask.id, newStatus: "todo" })}
                      disabled={updateTaskStatus.isPending}
                    >
                      <ArrowLeft className="h-4 w-4" /> Move to To-Do
                    </Button>
                    <Button 
                      className="w-full flex items-center gap-2 bg-success text-success-foreground hover:bg-success/90"
                      onClick={() => updateTaskStatus.mutate({ taskId: selectedTask.id, newStatus: "done" })}
                      disabled={updateTaskStatus.isPending}
                    >
                      <CheckCircle className="h-4 w-4" /> Mark Completed
                    </Button>
                  </>
                )}

                {/* Flow 3: Task is Completed */}
                {selectedTask.status === 'done' && (
                  <Button 
                    variant="outline"
                    className="w-full flex items-center gap-2 text-muted-foreground"
                    onClick={() => updateTaskStatus.mutate({ taskId: selectedTask.id, newStatus: "in_progress" })}
                    disabled={updateTaskStatus.isPending}
                  >
                    <ArrowLeft className="h-4 w-4" /> Reopen Task
                  </Button>
                )}

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW PROJECT MODAL */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Name</Label>
              <Input
                id="project-title"
                placeholder="e.g., Q3 Marketing Website"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-select">Assign Client</Label>
              <select
                id="client-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newProject.clientId}
                onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                required
              >
                {clients.length === 0 && <option value="">No clients found in DB</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsProjectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* NEW TASK MODAL */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
         <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="e.g., Design Homepage"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Details about the task..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <select
                  id="project"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  required
                >
                  {projects.length === 0 && <option value="">No projects found</option>}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}