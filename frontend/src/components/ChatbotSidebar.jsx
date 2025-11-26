import { useEffect, useRef, useState } from "react";
import { sendMessage, sendOrder } from "../service/chatbot.service";
import Toast from "./Toast";

export default function ChatbotSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]); // { role: 'user'|'bot', text }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingProducts, setPendingProducts] = useState(null); // <-- new state
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen, pendingProducts]);

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendMessage({ message: text });
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        const assistantText = res.assistantText ?? res.message ?? (typeof res === "string" ? res : JSON.stringify(res));
        const parsed = res.parsedProducts && Object.keys(res.parsedProducts).length ? res.parsedProducts : null;

        setMessages((m) => [...m, { role: "bot", text: assistantText }]);

        if (parsed) {
          setPendingProducts(parsed);
          setToast({ message: "Se detectaron productos en la conversación. Revisa y confirma.", type: "info" });
        }
      }
    } catch (err) {
      setToast({ message: `Error al enviar el mensaje ${err}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOrder = async () => {
    if (!pendingProducts || Object.keys(pendingProducts).length === 0) {
      setToast({ message: "No hay productos detectados para generar la orden", type: "error" });
      return;
    }
    setOrderLoading(true);
    try {
      const res = await sendOrder({ products: pendingProducts });
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        const reply = res.message ?? "Orden creada correctamente";
        setMessages((m) => [...m, { role: "bot", text: reply }]);
        setToast({ message: "Orden enviada correctamente", type: "success" });
        setPendingProducts(null);
        setMessages([]); // optional: clear conversation after order
      }
    } catch (err) {
      setToast({ message: `Error al enviar la orden ${err}`, type: "error" });
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCancelOrder = () => {
    setMessages([]);
    setInput("");
    setPendingProducts(null); // clear parsed products
    setToast({ message: "Conversación reiniciada", type: "info" });
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div
        className={`fixed right-4 bottom-6 z-50 flex flex-col items-end ${isOpen ? "" : "items-end"}`}
      >
        <div className="mb-3">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="bg-[#009BA6] hover:bg-[#007a82] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
            aria-label="Toggle chat"
          >
            💬 Chat
          </button>
        </div>

        {isOpen && (
          <div className="w-80 md:w-96 h-96 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-[#009BA6] text-white flex items-center justify-between">
              <div className="font-semibold">Asistente Natursur</div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white opacity-90 hover:opacity-100"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <div ref={listRef} className="flex-1 p-3 overflow-auto space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500 text-center mt-8">
                  Escribe tu pedido o consulta. El asistente puede crear una orden desde la conversación.
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}>
                    <div className={`${m.role === "user" ? "bg-[#009BA6] text-white" : "bg-white border"} inline-block px-3 py-2 rounded-lg shadow-sm`}>
                      <div className="text-sm">{m.text}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{m.role === "user" ? "Tú" : "Asistente"}</div>
                  </div>
                ))
              )}
            </div>

            {/* Parsed products preview */}
            {pendingProducts && (
              <div className="p-3 border-t bg-gray-50">
                <div className="text-sm font-medium mb-2">Pedidos detectados:</div>
                <div className="max-h-28 overflow-auto text-sm">
                  {Object.entries(pendingProducts).map(([name, qty]) => (
                    <div key={name} className="flex justify-between py-1">
                      <div className="truncate">{name}</div>
                      <div className="font-semibold">{qty}x</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t bg-white">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#009BA6]"
                placeholder="Escribe un mensaje..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading || orderLoading}
              />

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-[#009BA6] text-white px-3 py-2 rounded-lg hover:bg-[#007a82] transition disabled:opacity-60"
                  disabled={loading || orderLoading}
                >
                  {loading ? "Enviando..." : "Enviar"}
                </button>

                <button
                  onClick={handleSendOrder}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-60"
                  disabled={orderLoading || !pendingProducts || Object.keys(pendingProducts).length === 0}
                >
                  {orderLoading ? "Enviando pedido..." : "Confirmar pedido"}
                </button>

                <button
                  onClick={handleCancelOrder}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}