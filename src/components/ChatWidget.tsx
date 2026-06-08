import React, { useEffect, useRef, useState } from "react";

type Message = { id: number; sender: "user" | "agent"; text: string };

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), sender: "user", text };
    setMessages((s) => [...s, userMsg]);
    setInput("");

    // Placeholder agent response (to be implemented later)
    setTimeout(() => {
      setMessages((s) => [...s, { id: Date.now() + 1, sender: "agent", text: "Resposta do agente: (a implementar)" }]);
    }, 700);
  };

  return (
    <>
      <div className="fixed left-4 bottom-4 z-12">
        <button
          aria-label="Abrir chat"
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.86L3 21l1.86-4A8.94 8.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 sm:w-96 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full flex flex-col bg-background dark:bg-slate-900 shadow-xl z-11">
          <header className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Chat do Agente</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([])}
                className="text-sm text-slate-500 hover:text-slate-700"
                title="Limpar conversa"
              >
                Limpar
              </button>
              <button
                aria-label="Fechar chat"
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-center text-slate-400">Nenhuma mensagem ainda. Escreva abaixo para começar.</div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] ${m.sender === "user" ? "ml-auto bg-card  border border-border text-right" : "mr-auto bg-card border-blue-600 border text-left"} rounded-lg p-2`}> 
                <div className="text-sm">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Escreva sua mensagem..."
                    rows={1}
                    className="w-full resize-none bg-slate-800 border border-transparent focus:border-transparent focus:ring-0 px-4 py-2 pr-12 rounded-full text-sm shadow-sm placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={send}
                disabled={!input.trim()}
                aria-disabled={!input.trim()}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-150 focus:outline-none ${
                  input.trim()
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 hover:scale-105 shadow-lg text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                title="Enviar mensagem"
              >
                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" transform="rotate(-45 12 12)" />
                </svg> */}

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>              
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
