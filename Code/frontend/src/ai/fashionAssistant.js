import { useState } from "react";
import fashionAssistant from "./ai/fashionAssistant";

function FashionAssistantScreen({
  skinTone,
  bodyShape,
  styleDNA
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function handleAsk() {
    const response = fashionAssistant(
      question,
      {
        skinTone,
        bodyShape,
        styleDNA
      }
    );

    setAnswer(response);
  }

  return (
    <div>
      <h2>AI Fashion Assistant</h2>

      <input
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        placeholder="Ask anything..."
      />

      <button
        type="button"
        onClick={handleAsk}
      >
        Ask
      </button>

      {answer && (
        <div>
          {answer}
        </div>
      )}
    </div>
  );
}

export default FashionAssistantScreen;