import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Search, FolderKanban, CheckSquare, Users, Loader2, X } from "lucide-react";

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ["global-search", debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm || debouncedTerm.length < 2) return null;
      
      const safeTerm = debouncedTerm.replace(/,/g, '');

      const [projectsRes, tasksRes, clientsRes] = await Promise.all([
        supabase.from("projects").select("id, title").ilike("title", `%${safeTerm}%`).limit(3),
        supabase.from("tasks").select("id, title, status").ilike("title", `%${safeTerm}%`).limit(3),
        supabase.from("profiles")
          .select("id, full_name, company_name")
          .eq("role", "client")
          .or(`full_name.ilike.%${safeTerm}%,company_name.ilike.%${safeTerm}%`)
          .limit(3)
      ]);

      return {
        projects: projectsRes.data || [],
        tasks: tasksRes.data || [],
        clients: clientsRes.data || [],
      };
    },
    enabled: debouncedTerm.length >= 2,
  });

  const handleNavigate = (path: string, state?: any) => {
    navigate(path, { state });
    setIsOpen(false);
    setSearchTerm("");
  };

  const hasResults = results && (results.projects.length > 0 || results.tasks.length > 0 || results.clients.length > 0);

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search projects, tasks, or clients..."
          className="w-full pl-9 pr-10 py-2 bg-accent/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(""); setIsOpen(false); }}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && searchTerm.length >= 2 && (
        // FIX: Replaced bg-card with bg-[#09090b] for guaranteed 100% opacity in dark mode
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border border-border/50 rounded-xl shadow-2xl overflow-hidden z-[99999] max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          
          {isLoading && (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Searching...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{searchTerm}"
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="py-2">
              
              {results.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</div>
                  {results.projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleNavigate('/projects')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent/10 flex items-center gap-3 transition-colors text-foreground"
                    >
                      <FolderKanban className="h-4 w-4 text-primary" />
                      <span className="truncate">{project.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</div>
                  {results.tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleNavigate('/projects')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent/10 flex items-center justify-between transition-colors text-foreground"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <CheckSquare className="h-4 w-4 text-warning flex-shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-accent/20 px-2 py-0.5 rounded border border-border/50 uppercase ml-2 flex-shrink-0">
                        {task.status.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.clients.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clients</div>
                  {results.clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => handleNavigate('/messages', { newChatClient: client })}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent/10 flex flex-col transition-colors text-foreground"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-success" />
                        <span className="font-medium truncate">{client.company_name || client.full_name}</span>
                      </div>
                      {client.company_name && (
                        <span className="text-xs text-muted-foreground pl-7">{client.full_name}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}