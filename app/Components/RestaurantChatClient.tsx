"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { askAi } from "../api/Chat/askAi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RestaurantChatClientProps = {
  restaurantName: string;
};

export default function RestaurantChatClient({ restaurantName }: RestaurantChatClientProps) {
  const params = useParams();
  const restaurantId = Number.parseInt(params.id as string, 10);
  const { data: session } = useSession();
  const userStorageId = encodeURIComponent(session?.user?.id || session?.user?.email || "anonymous");
  const storageKey = `chat_history_${restaurantId}_${userStorageId}`;
  const defaultAssistantMessage = `Hi! I can help with questions about ${restaurantName}. Ask about menu details, location, or reservations.`;

  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: defaultAssistantMessage }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setHistoryLoaded(false);

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([{ role: "assistant", content: defaultAssistantMessage }]);
        }
      } else {
        setMessages([{ role: "assistant", content: defaultAssistantMessage }]);
      }
    } catch {
      // ignore parse errors
      setMessages([{ role: "assistant", content: defaultAssistantMessage }]);
    } finally {
      setHistoryLoaded(true);
    }
  }, [defaultAssistantMessage, storageKey]);

  useEffect(() => {
    if (!historyLoaded) {
      return;
    }

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [historyLoaded, messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const token = session?.backendAccessToken;
      if (!token) {
        throw new Error("Missing backend access token");
      }

      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error("Missing user email");
      }

      const reply = await askAi(trimmed, restaurantId, token, userEmail);
      console.log("AI query:", trimmed, restaurantId, userEmail);
      const finalReply = reply?.trim() || "I could not generate a response right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: finalReply }]);
    } catch (submitError) {
      console.error(submitError);
      setError("Message failed to send. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not process that right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="h-[60vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm sm:max-w-[80%] ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 ring-1 ring-slate-200"
                }`}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      a: ({ children, href }) => (
                        <a href={href} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200">Typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message..."
          className="input input-bordered flex-1"
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading || input.trim().length === 0}>
          Send
        </button>
      </form>
    </>
  );
}
