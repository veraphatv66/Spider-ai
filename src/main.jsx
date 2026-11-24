import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "ระบบพร้อมทำงานครับ ผมคือ SPIDER AI ผู้ช่วยส่วนตัวของคุณ มีอะไรให้ช่วยไหม?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState("th-TH");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("SYSTEM ONLINE");
  const [image, setImage] = useState("");
  const [health, setHealth] = useState(null);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(setHealth).catch(() => setHealth({ok:false}));
  }, []);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy]);

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(text = input) {
    const value = text.trim();
    if (!value || busy) return;
    const next = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setStatus("PROCESSING");
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "เชื่อมต่อไม่สำเร็จ");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      setStatus("SYSTEM ONLINE");
      speak(data.reply);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: `ระบบแจ้งเตือน: ${error.message}` }]);
      setStatus("CHECK CONNECTION");
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: "assistant", content: "เบราว์เซอร์นี้ยังไม่รองรับการรับเสียง กรุณาพิมพ์ข้อความแทน หรือทดลองใช้ Chrome บนคอมพิวเตอร์" }]);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setStatus("LISTENING"); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => { setListening(false); setStatus("SYSTEM ONLINE"); };
    recognition.onend = () => { setListening(false); setStatus("SYSTEM ONLINE"); };
    recognitionRef.current = recognition;
    recognition.start();
  }

  async function analyzeImage(file) {
    if (!file) return;
    if (file.size > 7 * 1024 * 1024) {
      setMessages(prev => [...prev, { role: "assistant", content: "รูปภาพมีขนาดใหญ่เกินไป กรุณาเลือกภาพที่เล็กกว่า 7 MB" }]);
      return;
    }
    setBusy(true);
    setStatus("SCANNING IMAGE");
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      setImage(dataUrl);
      try {
        const response = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl, question: "วิเคราะห์ภาพนี้เป็นภาษาไทย อธิบายสิ่งสำคัญที่มองเห็นอย่างชัดเจน" })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "วิเคราะห์ภาพไม่สำเร็จ");
        setMessages(prev => [...prev, { role: "assistant", content: `ผลการวิเคราะห์ภาพ:\n${data.reply}` }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: "assistant", content: `ระบบวิเคราะห์ภาพ: ${error.message}` }]);
      } finally {
        setBusy(false);
        setStatus("SYSTEM ONLINE");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✳</span><div><b>SPIDER<span> AI</span></b><small>PERSONAL INTELLIGENCE SYSTEM</small></div></div>
        <div className="top-actions">
          <span className={`connection ${health?.configured ? "ok" : "warn"}`}>{health?.configured ? "AI CONNECTED" : "API SETUP NEEDED"}</span>
          <select value={lang} onChange={e => setLang(e.target.value)} aria-label="เลือกภาษาเสียง">
            <option value="th-TH">THAI</option><option value="en-US">ENGLISH</option>
          </select>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><i /> {status}</div>
        <div className="core-wrap">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="core"><div className="core-inner">S<span>AI</span></div></div>
        </div>
        <h1>HOW CAN I <em>HELP</em> YOU?</h1>
        <p>YOUR PERSONAL AI ASSISTANT · THAI / ENGLISH</p>
      </section>

      <section className="workspace">
        <aside className="side-panel">
          <div className="panel-title">SYSTEM MODULES <span>04 ACTIVE</span></div>
          <div className="module"><b>01</b><div><strong>NEURAL CHAT</strong><small>AI conversation</small></div><i /></div>
          <div className="module"><b>02</b><div><strong>VOICE LINK</strong><small>Speech interface</small></div><i /></div>
          <button className="module module-button" onClick={() => fileRef.current?.click()}><b>03</b><div><strong>VISION SCAN</strong><small>Image understanding</small></div><span>＋</span></button>
          <div className="module"><b>04</b><div><strong>MEMORY CONTEXT</strong><small>Current chat session</small></div><i /></div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={e => analyzeImage(e.target.files?.[0])} />
          <div className="side-note">SECURE CONNECTION<br/><span>API KEY STORED SERVER-SIDE</span></div>
        </aside>

        <section className="chat-panel">
          <div className="chat-heading"><div><span className="live-dot"></span> ASSISTANT CHANNEL</div><small>ENCRYPTED SESSION</small></div>
          {image && <div className="image-preview"><img src={image} alt="ภาพที่เลือกเพื่อวิเคราะห์" /><button onClick={() => setImage("")}>CLEAR IMAGE</button></div>}
          <div className="messages">
            {messages.map((m, i) => <div className={`message ${m.role}`} key={i}><div className="avatar">{m.role === "assistant" ? "AI" : "YOU"}</div><div className="bubble"><small>{m.role === "assistant" ? "SPIDER AI" : "YOU"}</small><p>{m.content}</p>{m.role === "assistant" && <button className="speak" onClick={() => speak(m.content)}>▶ PLAY VOICE</button>}</div></div>)}
            {busy && <div className="typing"><span></span><span></span><span></span> ANALYZING</div>}
            <div ref={bottomRef} />
          </div>
          <div className="composer">
            <button className={`mic ${listening ? "recording" : ""}`} onClick={toggleMic} title="พูดกับ AI">🎙</button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="พิมพ์ข้อความหรือถาม SPIDER AI..." />
            <button className="send" disabled={busy || !input.trim()} onClick={() => sendMessage()}>SEND ↗</button>
          </div>
          <div className="disclaimer">VOICE INPUT DEPENDS ON BROWSER SUPPORT · CHECK BEFORE SHARING SENSITIVE INFORMATION</div>
        </section>
      </section>
      <footer><span>SPIDER AI // PERSONAL ASSISTANT</span><span>BUILD 1.0.0 · {new Date().getFullYear()}</span></footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
