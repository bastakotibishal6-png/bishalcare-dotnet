import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import './ChatBot.css';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are the Bishal Care Beauty Assistant — a warm, knowledgeable, and elegant AI beauty expert for Bishal Care, a premium luxury beauty e-commerce brand based in Pokhara, Nepal.

ABOUT Bishal Care:
- Premium skincare and makeup brand, vegan and cruelty-free
- 152 products: 64 skincare products and 88 makeup products
- All products are 100% vegan and cruelty-free
- Based in Pokhara, Nepal | Email: miraeluxe.ae@gmail.com
- Website sections: Shop All, Skin Quiz, Membership, About, Contact

PRODUCT CATEGORIES & PRICING:
Skincare:
- Cleansers: RS 79-95 (Gentle Gel Cleanser, Deep Foam Cleanser, Nourishing Oil Cleanser, etc.)
- Serums: RS 129-169 (Hyaluronic Acid Serum RS 149, Niacinamide Serum RS 139, Vitamin C Serum RS 159)
- Moisturizers: RS 149-199 (Hydrating Cream, Brightening Moisturizer, Anti-Aging Cream)
- Eye Creams: RS 129-159
- Toners: RS 89-119
- Sunscreens: RS 99-139 (SPF 30, SPF 50)
- Masks: RS 99-149

Makeup:
- Foundations: RS 129-179
- Lipsticks (Velvet Matte): RS 89
- Eyeshadow Palettes: RS 149-199
- Eyeliners: RS 69-89
- Mascaras: RS 99-129
- Blush & Bronzers: RS 99-139
- Setting Sprays: RS 89-119
- Makeup Brushes: RS 55-70

MEMBERSHIP (RS 99/year):
- 15% off ALL products on every order
- Free shipping on all orders (no minimum)
- Free gift with every order
- Early access to new product launches
- Exclusive member-only events
- Birthday month special discount
- Average member saves RS 900+ per year

SHIPPING & DELIVERY:
- Free shipping on orders over RS 200
- RS 20 flat rate for orders under RS 200
- Members always get free shipping
- Pokhara: 1-2 business days
- Nepal: 2-3 business days
- GCC: 3-5 business days
- Free gift included on orders over RS 120 (non-members) or every order (members)

SKIN QUIZ:
- Available at /skin-quiz on the website
- Personalized product recommendations based on skin type and concerns
- Results grouped by: Acne, Brightening, Hydration, Anti-Aging, Daily Essentials

KEY SKINCARE INGREDIENTS WE USE:
- Hyaluronic Acid: Deep hydration, plumps skin
- Niacinamide (Vitamin B3): Controls oil, minimizes pores, brightens
- Vitamin C: Brightening, collagen boost, dark spots
- Retinol: Anti-aging, cell turnover
- Ceramides: Barrier repair
- Peptides: Firming, anti-aging
- Centella Asiatica: Soothing, sensitive skin
- Salicylic Acid: Acne, exfoliation

INGREDIENTS WE NEVER USE: Parabens, sulfates, synthetic fragrances, animal-derived ingredients, mineral oil

YOUR PERSONALITY:
- Warm, professional, and encouraging like a luxury beauty consultant
- Use occasional beauty emojis (✨ 💎 🌸 💄) but don't overdo it
- Give specific, actionable advice
- Always relate answers back to Bishal Care products when relevant
- If asked about products, mention specific product names and prices from our range
- For skin concerns, give routine advice AND product recommendations
- Suggest the Skin Quiz at /skin-quiz for personalized recommendations
- Suggest Membership at /membership when discussing pricing or savings
- Keep responses concise but complete — avoid very long walls of text
- Format with line breaks for readability when listing steps or products
- If asked something completely unrelated to beauty or the store, politely redirect to beauty topics
- Never make up ingredients or products that don't exist
- Always recommend patch testing new products
- For medical skin conditions (eczema, psoriasis, rosacea), recommend consulting a dermatologist while still offering general advice`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! ✨ I'm your Bishal Care beauty assistant. I can help with skincare routines, product recommendations, ingredient advice, makeup tips, and anything about our store. What can I help you with today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory
          ],
          max_tokens: 600,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again!";

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);

    } catch (error) {
      console.error('Groq API error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or contact us at miraeluxe.ae@gmail.com for assistance! 💎"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content) =>
    content.split('\n').map((line, i, arr) => (
      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
    ));

  const quickQuestions = [
    "Best routine for dry skin?",
    "How to layer serums?",
    "Products for acne-prone skin?",
    "Tell me about membership"
  ];

  return (
    <>
      {!isOpen && (
        <button className="chat-bubble" onClick={() => setIsOpen(true)} aria-label="Open chat">
          <FiMessageCircle size={24} />
          <span className="chat-badge">Ask AI</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">

          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-avatar">✨</div>
              <div>
                <h3>Bishal Care Assistant</h3>
                <p>Your beauty expert</p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <FiX size={24} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              message.role === 'assistant' ? (
               
                <div key={index} className="chat-message assistant">
                  <div className="message-avatar assistant-avatar">✨</div>
                  <div className="message-content assistant-bubble">
                    {renderContent(message.content)}
                  </div>
                </div>
              ) : (
                
                <div key={index} className="chat-message user">
                  <div className="user-group">
                    <div className="message-content user-bubble">
                      {renderContent(message.content)}
                    </div>
                    <div className="message-avatar user-avatar">You</div>
                  </div>
                </div>
              )
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-avatar assistant-avatar">✨</div>
                <div className="message-content assistant-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="quick-questions">
              <p className="quick-questions-title">Popular questions:</p>
              {quickQuestions.map((q, index) => (
                <button key={index} className="quick-question-btn" onClick={() => setInput(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about skincare, makeup, ingredients..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <FiSend size={20} />
            </button>
          </div>

          <div className="chat-footer">
            Powered by Bishal Care AI • Always verify with professionals
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;