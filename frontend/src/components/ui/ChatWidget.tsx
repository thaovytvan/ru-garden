"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Loader2,
  MinusCircle,
  Leaf
} from "lucide-react";
import {
  Card,
  Flex,
  Text,
  TextField,
  IconButton,
  Badge
} from "@radix-ui/themes";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("rugarden_chat_session");
      if (!id) {
        id = Math.random().toString(36).substring(7);
        localStorage.setItem("rugarden_chat_session", id);
      }
      return id;
    }
    return "";
  });
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Initialize socket
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Chat socket connected:", socket.id);
      socket.emit("chat:join", sessionId);
    });

    socket.on("chat:history", (history: Message[]) => {
      console.log("📜 Chat history received:", history.length, "messages");
      setMessages(history);
    });

    socket.on("chat:message", (message: Message) => {
      console.log("📩 Chat message received:", message.role, message.id);
      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m.id === message.id);
        if (isDuplicate) return prev;

        // Replace temp user message with server-confirmed message
        if (message.role === "user") {
          return prev.map((m) =>
            m.id.startsWith("temp-") && m.content.trim() === message.content.trim()
              ? message
              : m
          );
        }

        return [...prev, message];
      });

      if (message.role === "assistant") {
        setIsLoading(false);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket Connection Error:", error.message);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = () => {
    if (!input.trim() || !socketRef.current || isLoading) return;

    // Optimistic update
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    socketRef.current.emit("chat:message", {
      sessionId,
      content: userMessage.content
    });
  };

  const markdownStyles = `
    .markdown-content p { margin: 0; }
    .markdown-content ul, .markdown-content ol { 
      margin-top: 4px; 
      margin-bottom: 4px; 
      padding-left: 20px; 
    }
    .markdown-content li { margin-bottom: 2px; }
    .markdown-content strong { font-weight: 700; color: inherit; }
  `;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <style>{markdownStyles}</style>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px]"
          >
            <Card className="shadow-2xl border border-primary/20 p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
              {/* Header */}
              <div className="bg-primary p-4 text-white">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1">
                      <Bot size={24} />
                    </div>
                    <div>
                      <Text weight="bold">Trợ lý AI Rú Garden</Text>
                      <Flex align="center" gap="1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <Text size="1" className="opacity-80">
                          Đang trực tuyến
                        </Text>
                      </Flex>
                    </div>
                  </Flex>
                  <IconButton
                    variant="ghost"
                    color="gray"
                    highContrast
                    onClick={() => setIsOpen(false)}
                  >
                    <MinusCircle size={20} />
                  </IconButton>
                </Flex>
              </div>

              {/* Chat Area */}
              <div
                ref={scrollRef}
                className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/30 scroll-smooth"
              >
                {messages.length === 0 && (
                  <div className="text-center py-10 space-y-4">
                    <div className="inline-block p-4 bg-primary/10 rounded-full text-primary">
                      <Leaf className="w-8 h-8" />
                    </div>
                    <Text size="2" color="gray" className="block px-6">
                      Chào bạn! Mình là Trợ lý AI của Rú Garden. Mình có thể
                      giúp bạn giải đáp thắc mắc về các loại cây và cách chăm
                      sóc. Bạn cần mình hỗ trợ gì không ạ?
                    </Text>
                  </div>
                )}

                {messages.map((msg) => (
                  <Flex
                    key={msg.id}
                    justify={msg.role === "user" ? "end" : "start"}
                    gap="2"
                    className="w-full"
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white">
                        <Bot size={16} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-white text-foreground rounded-tl-none border border-muted"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0 flex items-center justify-center text-white">
                        <User size={16} />
                      </div>
                    )}
                  </Flex>
                ))}

                {isLoading && (
                  <Flex gap="2" justify="start">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-muted flex items-center gap-2">
                      <Loader2
                        className="animate-spin text-primary"
                        size={16}
                      />
                      <Text size="2" color="gray">
                        Rú đang trả lời...
                      </Text>
                    </div>
                  </Flex>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-muted bg-white">
                <Flex gap="2">
                  <TextField.Root
                    size="3"
                    className="w-full"
                    placeholder="Hỏi Rú về các loại cây..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <IconButton
                    size="3"
                    variant="solid"
                    color="grass"
                    radius="full"
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                  >
                    <Send size={18} />
                  </IconButton>
                </Flex>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary/20"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && messages.length === 0 && (
          <Badge
            color="red"
            variant="solid"
            radius="full"
            className="absolute -top-1 -right-1 size-6 flex items-center justify-center border-2 border-white"
          >
            1
          </Badge>
        )}
      </motion.button>
    </div>
  );
};
