'use client';

import { useState, useEffect, useRef } from 'react';

export default function SmartAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hi! I am Anshveer\'s AI assistant. You can ask me questions about his projects, skills, and experience, or tell me to navigate somewhere!' }]);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({ email: '', subject: '', message: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingIntent]);
  
  const fetchChatResponse = async (text) => {
    setLoadingIntent(true);
    
    // --- INSTANT FAST-NAVIGATION ---
    const lowerText = text.toLowerCase();
    const navigateOffsets = {
      'intro': 0.0,
      'skills': 0.242,
      'projects': 0.565,
      'experience': 0.726,
      'contact': 0.968
    };

    const aboutKeywords = ['who', 'about', 'intro', 'background', 'profile', 'student', 'study', 'domain', 'yourself', 'developer are you'];
    const skillKeywords = ['skill', 'tech', 'stack', 'framework', 'backend', 'frontend', 'ai', 'ml', 'tool', 'devops', 'cloud', 'database', 'good at', 'languages'];
    const projectKeywords = ['project', 'built', 'portfolio', 'work', 'app', 'developed', 'github', 'created', 'made', 'working on', 'startup', 'side'];
    const experienceKeywords = ['experience', 'work', 'intern', 'job', 'dell', 'smartbridge', 'google', 'industry', 'practical', 'history'];
    const contactKeywords = ['contact', 'email', 'reach', 'phone', 'linkedin', 'social', 'connect', 'message', 'touch'];

    let instantNavigate = null;
    if (projectKeywords.some(k => lowerText.includes(k))) instantNavigate = 'projects';
    else if (experienceKeywords.some(k => lowerText.includes(k))) instantNavigate = 'experience';
    else if (skillKeywords.some(k => lowerText.includes(k))) instantNavigate = 'skills';
    else if (contactKeywords.some(k => lowerText.includes(k))) instantNavigate = 'contact';
    else if (aboutKeywords.some(k => lowerText.includes(k))) instantNavigate = 'intro';

    if (instantNavigate) {
      if (instantNavigate === 'contact') setShowEmailForm(true);
      if (window.aiNavigate) {
        window.aiNavigate(navigateOffsets[instantNavigate]);
      }
    }
    // -------------------------------

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply || data.error }]);

      const navigateOffsets = {
        'intro': 0.0,
        'skills': 0.242,
        'projects': 0.565,
        'experience': 0.726,
        'contact': 0.968
      };

      if (data.navigate && navigateOffsets[data.navigate] !== undefined) {
        if (data.navigate === 'contact') setShowEmailForm(true);
        if (window.aiNavigate) {
          window.aiNavigate(navigateOffsets[data.navigate]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops, something went wrong connecting to my brain!" }]);
    } finally {
      setLoadingIntent(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleQuickReply = (text) => {
    if (loadingIntent) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    fetchChatResponse(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loadingIntent) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    fetchChatResponse(input);

    setInput('');
    setSentiment(null);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailData.email || !emailData.message) return;
    
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });
      if (res.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: "Email sent successfully! I'll make sure Anshveer gets it." }]);
        setShowEmailForm(false);
        setEmailData({ email: '', subject: '', message: '' });
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "Failed to send email. Please try again later or use the direct links in the contact section." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "An error occurred while sending the email." }]);
    }
    setIsSendingEmail(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 md:bottom-6 right-6 z-50 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-105 border border-indigo-400/30 transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-10 md:bottom-6 right-6 z-50 w-80 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-700/50 overflow-hidden flex flex-col h-[28rem]">
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 p-3 flex justify-between items-center border-b border-indigo-500/20 shadow-md">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          AI Navigator
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm' : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50 rounded-bl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loadingIntent && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 text-xs p-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
              <span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        {showEmailForm && (
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 mt-2 text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-200">Send an Email</span>
              <button onClick={() => setShowEmailForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-2">
              <input type="email" placeholder="Your Email" required value={emailData.email} onChange={e => setEmailData({...emailData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white placeholder-slate-500" />
              <input type="text" placeholder="Subject" value={emailData.subject} onChange={e => setEmailData({...emailData, subject: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white placeholder-slate-500" />
              <textarea placeholder="Message" required rows={3} value={emailData.message} onChange={e => setEmailData({...emailData, message: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white placeholder-slate-500"></textarea>
              <button type="submit" disabled={isSendingEmail} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded p-2 disabled:opacity-50">
                {isSendingEmail ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes slightShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .emoji-positive { animation: subtleBounce 1s infinite ease-in-out; display: inline-block; }
        .emoji-negative { animation: slightShake 1s infinite ease-in-out; display: inline-block; }
        .emoji-neutral { animation: pulseSoft 2s infinite ease-in-out; display: inline-block; }
      `}} />
      <div className="p-3 bg-slate-800/50 border-t border-slate-700">
        {sentiment && (
          <div className="text-xs mb-2 flex items-center justify-between px-1">
            <span className="text-slate-400">Live Sentiment:</span>
            <span className="text-xl">
              {sentiment.label === 'POSITIVE' && sentiment.score > 0.6 ? <span className="emoji-positive">😄</span> : 
               sentiment.label === 'NEGATIVE' && sentiment.score > 0.6 ? <span className="emoji-negative">😞</span> : 
               <span className="emoji-neutral">😐</span>}
            </span>
          </div>
        )}
        {!showEmailForm && (
          <>
            <div className="flex gap-2 px-1 mb-2 overflow-x-auto pb-1 scrollbar-hide">
              {['What is his tech stack?', 'How do I contact him?'].map((chip) => (
                <button 
                  key={chip} 
                  type="button"
                  onClick={() => handleQuickReply(chip)}
                  className="whitespace-nowrap text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded-full transition"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message or question..."
                className="flex-1 bg-slate-950 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button type="submit" disabled={loadingIntent} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
