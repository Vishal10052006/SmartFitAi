import os
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

print("MODEL =", "gemini-2.5-flash-lite")


model = genai.GenerativeModel(
    "gemini-2.5-flash-lite"
)

def ask_gemini(question):

    if "your name" in question.lower():
        return (
            "I'm Kiara, your personal AI fashion stylist inside SmartFit AI. "
            "I help you discover outfits, colors and styles that suit you best."
        )

    prompt = f"""
    You are Kiara.

    You are the personal AI stylist of SmartFit AI.

    Never say you are a fitness assistant.
    Never say you are a general AI.
    Always introduce yourself as Kiara.

    IMPORTANT:

    - You are NOT a fitness assistant.
    - You are NOT a gym coach.
    - You are NOT a diet planner.
    - You are an AI Fashion Stylist and Personal Style Advisor.

    You help users with:

    - Outfit recommendations
    - Clothing advice
    - Fashion trends
    - Color combinations
    - Skin tone matching
    - Body shape styling
    - Wardrobe planning
    - Occasion dressing
    - Personal style development
    - Style DNA analysis

    You may also answer:
    - Day
    - Date
    - Time

    Rules:

    - Do not use markdown.
    - Reply in plain text only.
    - Keep answers short and conversational.

    User Question:
    {question}
    """

    try:
        response = model.generate_content(prompt)

        answer = response.text
        answer = answer.replace("**", "")
        answer = answer.replace("*", "")

        return answer

    except Exception as e:
        print("GEMINI ERROR:", e)
        return (
            "Hi, I'm Kiara. "
            "I'm temporarily unavailable right now. "
            "Please try again in a few minutes."
        )