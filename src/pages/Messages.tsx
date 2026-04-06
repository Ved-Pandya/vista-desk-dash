import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Paperclip, Hash, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ProjectThread = {
  id: string;
  title: string;
  client_id: string; // <-- Added so we can match it
  client: { full_name: string } | null;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: { full_name: string; role: string } | null;
};

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch available chat threads (Projects)
  const { data: threads = [], isLoading: loadingThreads } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        // Added client_id to the select query
        .select(`id, title, client_id, client:client_id(full_name)`);
      if (error) throw error;
      return (data || []) as any as ProjectThread[];
    },
  });

  // --- NEW FEATURE: Handle incoming traffic from Global Search ---
  useEffect(() => {
    const handleNewClientChat = async () => {
      const newClient = location.state?.newChatClient;
      if (!newClient) return;

      // Look for an existing thread for this client
      const existingThread = threads.find(t => t.client_id === newClient.id);
      
      if (existingThread) {
        // Chat exists, select it
        setActiveProjectId(existingThread.id);
      } else {
        // No chat exists! Auto-create a "General Support" project to house the chat
        const { data, error } = await supabase.from('projects').insert([{
          title: 'General Support',
          client_id: newClient.id,
          status: 'active'
        }]).select().single();

        if (data) {
          queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
          setActiveProjectId(data.id);
          toast.success(`Created a new chat thread for ${newClient.company_name || newClient.full_name}`);
        } else {
          toast.error("Failed to create a new chat for this client.");
        }
      }
      
      // Clear the router state so this doesn't accidentally run again if they refresh
      navigate(location.pathname, { replace: true });
    };

    if (!loadingThreads && location.state?.newChatClient) {
      handleNewClientChat();
    }
  }, [location.state, threads, loadingThreads, navigate, queryClient]);
  // -------------------------------------------------------------

  // Set first thread as active by default if none selected and not coming from search
  useEffect(() => {
    if (threads.length > 0 && !activeProjectId && !location.state?.newChatClient) {
      setActiveProjectId(threads[0].id);
    }
  }, [threads, activeProjectId, location.state]);

  // 2. Fetch messages for the active thread
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select(`id, content, created_at, sender_id, profiles(full_name, role)`)
        .eq("project_id", activeProjectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!activeProjectId,
  });

  // 3. Set up Real-Time Subscription
  useEffect(() => {
    if (!activeProjectId) return;

    const channel = supabase
      .channel(`room:${activeProjectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${activeProjectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", activeProjectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeProjectId, queryClient]);

  // Scroll to bottom when messages load/update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Handle Sending a Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeProjectId || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert([
        {
          project_id: activeProjectId,
          sender_id: user.id,
          content: newMessage.trim(),
        },
      ]);
      if (error) throw error;
      setNewMessage(""); 
    } catch (error: any) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.id === activeProjectId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Left Sidebar: Threads List */}
      <div className="w-full md:w-80 flex flex-col bg-background border border-border/50 rounded-xl overflow-hidden glass-card">
        <div className="p-4 border-b border-border/50 bg-accent/5">
          <h2 className="font-semibold">Active Threads</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveProjectId(thread.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                activeProjectId === thread.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent/10"
              }`}
            >
              <Hash className="h-5 w-5 opacity-70" />
              <div className="overflow-hidden">
                <p className="font-medium truncate text-sm">{thread.title}</p>
                <p className={`text-xs truncate ${activeProjectId === thread.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {thread.client?.full_name || "Internal Agency"}
                </p>
              </div>
            </button>
          ))}
          {threads.length === 0 && (
            <p className="text-sm text-muted-foreground text-center p-4">No active projects found.</p>
          )}
        </div>
      </div>

      {/* Right Area: Active Chat */}
      <div className="flex-1 flex flex-col bg-background border border-border/50 rounded-xl overflow-hidden glass-card">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-accent/5">
          <div>
            <h2 className="font-semibold text-lg">{activeThread?.title || "Select a thread"}</h2>
            <p className="text-xs text-muted-foreground">Real-time client & team communication</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
             <div className="animate-pulse space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-16 bg-accent/10 rounded-lg max-w-md" />)}
             </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const isAgency = msg.profiles?.role?.includes("agency");

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isMe && <UserCircle className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs font-medium text-muted-foreground">
                      {msg.profiles?.full_name || "Unknown User"} 
                      {!isMe && isAgency && " (Team)"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {format(new Date(msg.created_at), "h:mm a")}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-accent/10 border border-border/50 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 bg-background border-t border-border/50">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <button
              type="button"
              className="p-3 text-muted-foreground hover:text-primary transition-colors bg-accent/5 rounded-xl border border-border/50"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-accent/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={!activeProjectId || sending}
            />
            <button
              type="submit"
              disabled={!activeProjectId || !newMessage.trim() || sending}
              className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}