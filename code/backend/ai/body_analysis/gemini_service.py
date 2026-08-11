import os
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

print("MODEL =", "gemini-flash-lite-latest")

model = genai.GenerativeModel(
    "gemini-flash-lite-latest"
)

def ask_gemini(question, history=None, profile=None):

    if "your name" in question.lower():
        return (
            "I'm Kiara, your personal AI fashion stylist inside SmartFit AI. "
            "I help you discover outfits, colors and styles that suit you best."
        )

    history = history or []
    history_text = "\n".join(
        f"{'User' if h['role']=='user' else 'Kiara'}: {h['text']}"
        for h in history[-8:]
    )

    profile = profile or {}
    profile_lines = []
    if profile.get("skin_tone"):
        profile_lines.append(f"- Skin tone: {profile['skin_tone']}")
    if profile.get("body_shape"):
        profile_lines.append(f"- Body shape: {profile['body_shape']}")
    if profile.get("style_identity"):
        profile_lines.append(f"- Style identity: {profile['style_identity']}")

    profile_text = (
        "\n".join(profile_lines)
        if profile_lines
        else "This user hasn't analyzed a photo yet. Don't assume their skin tone or body shape — invite them to run an analysis if it's relevant to their question."
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

    You may also answer: Day, Date, Time

    Rules:
    - Do not use markdown.
    - Reply in plain text only.
    - Keep answers short and conversational.

    This user's profile:
    {profile_text}

    Conversation so far:
    {history_text if history_text else "(no prior messages)"}

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
        if "429" in str(e) or "quota" in str(e).lower():
            return (
                "Hi, I'm Kiara. I'm getting a lot of requests right now — "
                "give me a minute and try again."
            )
        return (
            "Hi, I'm Kiara. I'm temporarily unavailable right now. "
            "Please try again in a few minutes."
        )