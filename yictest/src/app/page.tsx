"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
  loading?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial bot message
    setMessages([
      {
        sender: "bot",
        text: "Hi! This is a demo chat bot. Type something and hit send.",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    // Add loading bot message
    const loadingMessage: Message = {
      sender: "bot",
      text: "",
      loading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: `You said: ${text}`,
        };
        return updated;
      });
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1f2a44] text-[#e3e8ff] flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-5xl font-bold tracking-wide my-2">You In Control Chat Bot</h1>
      <p className="text-xl mb-4">Start chatting away</p>

      <div className="w-full max-w-xl flex flex-col bg-[#1f2a44]/85 rounded-[14px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden flex-1 max-h-[550px]">
        {/* Message area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2 scrollbar-thin">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`backdrop-blur-sm px-4 py-2 text-sm rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-white/10 rounded-br-md"
                    : "bg-white/5 rounded-bl-md"
                }`}
              >
                {msg.loading ? (
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0s]" />
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 border-t border-white/10 p-3 bg-[#17203c]/90">
          <input
            type="text"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white/5 text-white text-sm p-3 rounded-full focus:outline-none placeholder:text-gray-300"
          />
          <button
            onClick={handleSend}
            className="bg-indigo-500 hover:bg-indigo-600 transition px-4 py-2 text-sm font-semibold text-white rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
