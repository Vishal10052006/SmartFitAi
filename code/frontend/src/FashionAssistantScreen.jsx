import { useState, useEffect, useRef } from "react";

import { getLocalResponse }
from "./ai/assistant/localFashionBrain";

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

function FashionAssistantScreen({
  skinTone,
  bodyShape,
  styleDNA,
  onAction
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved =
      localStorage.getItem("smartfit-chat");

    return saved
      ? JSON.parse(saved)
      : [
          {
            sender: "ai",
            text:
              "Hi, I'm SmartFit AI 👋 I can help with outfit recommendations, color matching, Style DNA insights, wardrobe advice and occasion-based dressing."
          }
        ];
  });
  const [isOpen, setIsOpen] = useState(false);

  const [isListening, setIsListening] =
  useState(false);

  const recognitionRef = useRef(null);

  const processQuestionRef = useRef(null);

  // Keep ref always updated
  useEffect(() => {
    processQuestionRef.current = processQuestion;
  });

  useEffect(() => {
    localStorage.setItem(
      "smartfit-chat",
      JSON.stringify(messages)
    );
  }, [messages]);

  useEffect(() => {

    if (!SpeechRecognition) return;

    recognitionRef.current =
      new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

  }, []);

  useEffect(() => {

  if (!SpeechRecognition) {
    console.log("Speech not supported");
    return;
  }

  const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("MIC STARTED");
    };

    recognition.onspeechstart = () => {
      console.log("SPEECH DETECTED");
    };

    recognition.onspeechend = () => {
      console.log("SPEECH ENDED");
    };

    // ✅ NEW - always calls latest version
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("VOICE:", transcript);

      if (
        transcript.includes("stop listening") ||
        transcript.includes("turn off voice mode")
      ) {
        stopListening();
        speak("Voice mode turned off");
        return;
      }

      processQuestionRef.current(transcript); // 👈 key change
    };

    recognition.onerror = (event) => {
      console.log("ERROR:", event.error);
    };

    recognitionRef.current = recognition;

    recognition.onaudiostart = () => {
      console.log("AUDIO START");
    };

    recognition.onsoundstart = () => {
      console.log("SOUND START");
    };

    recognition.onspeechstart = () => {
      console.log("SPEECH DETECTED");
    };

    recognition.onspeechend = () => {
      console.log("SPEECH ENDED");
    };

    recognition.onaudioend = () => {
      console.log("AUDIO END");
    };

  }, []);

  async function processQuestion(text) {

    try {

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text
        }
      ]);

      const localAnswer =
        getLocalResponse(text);

      if (localAnswer.handled) {

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: localAnswer.answer
          }
        ]);

        speak(localAnswer.answer);

        if (
          localAnswer.action &&
          onAction
        ) {
          onAction(localAnswer.action);
        }

        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: text,
            history: messages.slice(-8).map(m => ({
              role: m.sender === "user" ? "user" : "assistant",
              text: m.text
            }))
          })
        }
      );

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer
        }
      ]);

      speak(data.answer);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I couldn't connect to Gemini."
        }
      ]);
    }
  }

  function handleAsk() {

    if (!question.trim()) return;

    processQuestion(question);

    setQuestion("");
  }

  function speak(text) {

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.onend = () => {

      if (
        isListening &&
        recognitionRef.current
      ) {
        recognitionRef.current.start();
      }
    };

    window.speechSynthesis.speak(
      utterance
    );
  }

  function startListening() {

    setIsListening(true);

    recognitionRef.current.start();
  }

  function stopListening() {

    setIsListening(false);

    recognitionRef.current.stop();
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999
      }}
    >

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontSize: "28px",
            background: "#6C63FF",
            color: "#fff",
            boxShadow:
              "0 0 25px rgba(108,99,255,0.6)"
          }}
        >
          ✨
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: "320px",
            height: "420px",
            background: "#111827",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid #333",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column"
          }}
        >

          {/* Header */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            <strong
              style={{
                color: "#fff"
              }}
            >
              Kiara Style Expert
            </strong>

            <div
              style={{
                display: "flex",
                gap: "8px"
              }}
            >
              <button
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem("smartfit-chat");
                }}
                style={{
                  background: "#222",
                  border: "none",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Clear
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "12px",
              paddingRight: "4px"
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: "14px",
                  textAlign: "center",
                  marginTop: "30px"
                }}
              >
                Ask me anything about your style ✨
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  textAlign:
                    msg.sender === "user"
                      ? "right"
                      : "left"
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "85%",
                    background:
                      msg.sender === "user"
                        ? "#6C63FF"
                        : "#222",
                    color: "#fff"
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}

          <input
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAsk();
              }
            }}
            placeholder="Ask about outfits, colors or style..."
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#1F2937",
              color: "#fff"
            }}
          />

          <button
            onClick={handleAsk}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              marginBottom: "10px",
              boxSizing: "border-box",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#1F2937",
              color: "#fff"
            }}
          >
            Ask
          </button>

          <button
            onClick={startListening}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            🎙️ Talk To kiera
          </button>

        </div>
      )}

    </div>
  );
}

export default FashionAssistantScreen;