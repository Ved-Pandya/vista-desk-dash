import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Thread {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  sender: "agency" | "client";
  name: string;
  text: string;
  time: string;
}

const threads: Thread[] = [
  { id: "1", name: "Acme Corp", initials: "AC", lastMessage: "Can we schedule a review for the landing page?", time: "2m", unread: 3 },
  { id: "2", name: "CloudNine Inc.", initials: "CN", lastMessage: "API docs have been shared.", time: "1h", unread: 1 },
  { id: "3", name: "TechStart", initials: "TS", lastMessage: "Looks great! Approved.", time: "3h", unread: 0 },
  { id: "4", name: "Finova", initials: "FN", lastMessage: "We need to discuss the dashboard layout.", time: "1d", unread: 0 },
  { id: "5", name: "HealthTrack", initials: "HT", lastMessage: "Payment integration is live!", time: "2d", unread: 0 },
];

const messagesByThread: Record<string, Message[]> = {
  "1": [
    { id: "m1", sender: "client", name: "Acme Corp", text: "Hi! We've reviewed the initial mockups and love the direction.", time: "10:30 AM" },
    { id: "m2", sender: "agency", name: "You", text: "That's great to hear! We've started implementing the hero section with the animated SVG backgrounds.", time: "10:35 AM" },
    { id: "m3", sender: "client", name: "Acme Corp", text: "Perfect. Can we schedule a review for the landing page this Friday?", time: "10:38 AM" },
    { id: "m4", sender: "agency", name: "You", text: "Absolutely. I'll send a calendar invite for 2 PM. We'll have the responsive version ready by then.", time: "10:40 AM" },
    { id: "m5", sender: "client", name: "Acme Corp", text: "Can we also discuss the contact form integration? We want it connected to our CRM.", time: "10:42 AM" },
  ],
  "2": [
    { id: "m1", sender: "agency", name: "You", text: "We've completed the API documentation. Sharing the link now.", time: "9:00 AM" },
    { id: "m2", sender: "client", name: "CloudNine", text: "Received, thanks! We'll review and get back with questions.", time: "9:15 AM" },
  ],
};

export default function Messages() {
  const [activeThread, setActiveThread] = useState("1");
  const [inputValue, setInputValue] = useState("");
  const messages = messagesByThread[activeThread] || [];
  const activeThreadData = threads.find((t) => t.id === activeThread);

  return (
    <div className="animate-fade-in h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Client communication hub</p>
      </div>

      <div className="glass-card flex h-[calc(100%-4rem)] overflow-hidden">
        {/* Thread list */}
        <div className="w-72 border-r border-border/50 flex flex-col">
          <div className="p-3 border-b border-border/50">
            <Input placeholder="Search conversations..." className="h-8 text-sm bg-secondary/50 border-border/50" />
          </div>
          <ScrollArea className="flex-1">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread.id)}
                className={`w-full p-3 flex items-start gap-3 text-left transition-colors hover:bg-secondary/50 ${
                  activeThread === thread.id ? "bg-secondary/80" : ""
                }`}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/15 text-primary">{thread.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{thread.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{thread.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] shrink-0">
                    {thread.unread}
                  </Badge>
                )}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border/50 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/15 text-primary">
                {activeThreadData?.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{activeThreadData?.name}</p>
              <p className="text-[10px] text-muted-foreground">Online</p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "agency" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                    msg.sender === "agency"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender === "agency" ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
    </div>
  );
}
