import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "./api"; // Ensure this matches your existing API helper path
import "./ChatBot.css";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hi! I'm your AI shopping assistant. Ask me about products or returns!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the newest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // 1. Add User Message immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Call Backend API
      const { data } = await API.post("/api/chat", { message: userMessage });
      
      const botResponse = { 
        role: "bot", 
        content: data.reply,
        products: data.products // This handles the product cards if sent by backend
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I'm having trouble connecting to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Toggle Button (The Bubble) */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* The Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Shopping Assistant</span>
            <button className="close-chat" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content}
                
                {/* Render Product Cards if they exist in the response */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    {msg.products.map((p) => (
                      <div key={p._id} className="chat-product-card">
                        <strong>{p.name}</strong>
                        <span>Price: ₹{p.price}</span>
                        <Link to={`/product/${p._id}`} onClick={() => setIsOpen(false)}>
                          View Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div className="message bot">...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </div>
  );
}