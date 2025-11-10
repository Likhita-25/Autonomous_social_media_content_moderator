from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from transformers import pipeline
import torch
import re
import random
import requests
import os

app = Flask(__name__, static_folder="../frontend/build")
CORS(app)

# -----------------------------
# Database connection helper
# -----------------------------
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", "Likhita@4187"),
        database=os.environ.get("DB_NAME", "social_app")
    )

# -----------------------------
# ML Models
# -----------------------------
device = 0 if torch.cuda.is_available() else -1

sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=device
)

# -----------------------------
# Hugging Face Rewriter (Free API)
# -----------------------------
HF_API_KEY = os.environ.get("HF_API_KEY")
HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small"
HF_HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# -----------------------------
# Polite suggestion pool
# -----------------------------
polite_suggestions_pool = [
    "Consider expressing your opinion more calmly.",
    "Try to phrase your feedback constructively.",
    "Focus on how the service can improve rather than criticizing.",
    "Use polite words to convey frustration.",
    "Make your post more solution-oriented than complaint-oriented.",
    "Try sharing your experience without harsh language.",
    "Consider being specific about what went wrong politely.",
    "Avoid using insults; explain the issue clearly.",
    "Focus on improving communication rather than blaming.",
    "Try to keep the tone neutral and factual."
]

# -----------------------------
# Bad words and phrases maps
# -----------------------------
bad_words_map = {
    "arse": "unpleasant person", "arsehead": "unpleasant person",
    "arsehole": "unpleasant person", "ass": "unpleasant person",
    "asshole": "unpleasant person", "assholes": "unpleasant person",
    "bastard": "fool", "bastards": "fools", "bitch": "mean person",
    "bloody": "annoying", "bollocks": "nonsense", "bugger": "troublemaker",
    "bullshit": "nonsense", "cock": "jerk", "cunt": "fool", "crap": "nonsense",
    "damn": "darn", "dick": "jerk", "fucker": "jerk", "fucking": "very",
    "idiot": "uninformed person", "jerk": "unpleasant person",
    "stupid": "uninformed", "worst": "least favorable", "awful": "unpleasant",
    "rude": "impolite", "useless": "unproductive"
}

phrase_map = {
    "toxic as hell": "challenging environment",
    "freaking disaster": "problematic situation",
    "total unpleasant person": "very difficult person",
    "fake smiles": "insincere behavior"
}

sensitive_topics = {
    "religion": ["religion", "faith", "holy", "church", "temple", "mosque"],
    "racism": ["racist", "ethnic", "black", "white", "brown", "discriminate"],
    "harassment": ["harass", "bully", "abuse", "molest"]
}

# -----------------------------
# Helper Functions
# -----------------------------
def auto_correct_text(text):
    try:
        url = "https://api.languagetool.org/v2/check"
        data = {"text": text, "language": "en-US"}
        response = requests.post(url, data=data).json()
        corrected = text
        for match in reversed(response['matches']):
            if match['replacements']:
                rep = match['replacements'][0]['value']
                start = match['offset']
                end = start + match['length']
                corrected = corrected[:start] + rep + corrected[end:]
        return corrected
    except Exception:
        return text

def dynamic_bad_word_replace(text):
    def replace(match):
        word = match.group().lower()
        return bad_words_map.get(word, "unpleasant word")
    pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in bad_words_map.keys()) + r')\b', flags=re.IGNORECASE)
    return pattern.sub(replace, text)

def replace_harsh_phrases(text):
    for k, v in phrase_map.items():
        text = re.sub(re.escape(k), v, text, flags=re.IGNORECASE)
    return text

def rewrite_post(text):
    prompt = f"Rewrite politely and positively: {text}"
    try:
        response = requests.post(HF_API_URL, headers=HF_HEADERS, json={"inputs": prompt})
        result = response.json()
        if isinstance(result, list) and "generated_text" in result[0]:
            polite_text = result[0]["generated_text"].strip()
            polite_text = dynamic_bad_word_replace(polite_text)
            polite_text = replace_harsh_phrases(polite_text)
            return polite_text
        return replace_harsh_phrases(dynamic_bad_word_replace(text))
    except Exception as e:
        print("Rewriter API error:", e)
        return replace_harsh_phrases(dynamic_bad_word_replace(text))

def generate_dynamic_suggestions(text):
    suggestions = random.sample(polite_suggestions_pool, 3)
    negative_words = list(bad_words_map.keys()) + ["hate", "terrible", "stupid", "worst", "awful"]
    severity = sum(text.lower().count(w) for w in negative_words) / max(len(text.split()), 1)
    return suggestions, min(round(severity, 2), 1.0)

def detect_sensitive_topics(text):
    detected = []
    for topic, keywords in sensitive_topics.items():
        for word in keywords:
            if re.search(r'\b' + re.escape(word) + r'\b', text, flags=re.IGNORECASE):
                detected.append(topic)
                break
    return detected

# -----------------------------
# Routes
# -----------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    if cursor.fetchone():
        cursor.close(); db.close()
        return jsonify({"error": "User already exists"}), 400

    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    db.commit(); cursor.close(); db.close()
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s", (username, password))
    user = cursor.fetchone()
    cursor.close(); db.close()

    if user:
        return jsonify({"message": "Login successful", "user": user})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route("/post", methods=["POST"])
def post_route():
    data = request.json
    username = data.get("username")
    text = data.get("text", "").strip()

    if not username:
        return jsonify({"error": "Username is required"}), 400
    if not text:
        return jsonify({"error": "No post content"}), 400

    corrected_text = auto_correct_text(text)
    result = sentiment_analyzer(corrected_text)[0]
    label = result.get("label", "").upper()
    score = result.get("score", 0)

    if label == "NEGATIVE" and score < 0.85:
        score *= 0.6

    sensitive_detected = detect_sensitive_topics(corrected_text)
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    if sensitive_detected:
        suggestions, severity = generate_dynamic_suggestions(corrected_text)
        rewritten_post = rewrite_post(corrected_text)
        cursor.execute(
            "INSERT INTO sensitive_posts (username, content, sentiment, topics, suggestion) VALUES (%s, %s, %s, %s, %s)",
            (username, corrected_text, "NEGATIVE", ", ".join(sensitive_detected), ". ".join(suggestions))
        )
        db.commit(); cursor.close(); db.close()
        return jsonify({
            "status": "alert",
            "message": "Sensitive topics detected! Post rewritten and flagged for review.",
            "topics": sensitive_detected,
            "sensitivity_score": round(score * 100, 2),
            "suggestions": suggestions,
            "auto_correction": rewritten_post
        })

    if label == "POSITIVE":
        cursor.execute(
            "INSERT INTO moderated_posts (username, content, sentiment) VALUES (%s, %s, %s)",
            (username, corrected_text, "POSITIVE")
        )
        db.commit(); cursor.close(); db.close()
        return jsonify({
            "status": "approved",
            "message": "Post saved successfully",
            "sentiment": "POSITIVE",
            "sensitivity_score": round((1 - score) * 100, 2)
        })
    else:
        suggestions, severity = generate_dynamic_suggestions(corrected_text)
        rewritten_post = rewrite_post(corrected_text)
        cursor.execute(
            "INSERT INTO negative_posts (username, content, sentiment, suggestion) VALUES (%s, %s, %s, %s)",
            (username, corrected_text, "NEGATIVE", ". ".join(suggestions))
        )
        db.commit(); cursor.close(); db.close()
        return jsonify({
            "status": "rejected",
            "message": "Post seems negative and suggestions have been saved.",
            "sentiment": "NEGATIVE",
            "sensitivity_score": round(score * 100, 2),
            "suggestions": suggestions,
            "auto_correction": rewritten_post
        })

@app.route("/moderated_posts", methods=["GET"])
def get_moderated_posts():
    username = request.args.get("username")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    if username:
        cursor.execute("SELECT * FROM moderated_posts WHERE username=%s ORDER BY created_at DESC", (username,))
    else:
        cursor.execute("SELECT * FROM moderated_posts ORDER BY created_at DESC")

    posts = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(posts)

@app.route("/analytics_posts", methods=["GET"])
def analytics_posts():
    username = request.args.get("username")
    if not username:
        return jsonify({"error": "Username required"}), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, content, sentiment FROM moderated_posts WHERE username=%s", (username,))
    approved = cursor.fetchall()
    cursor.execute("SELECT id, content, sentiment, suggestion FROM negative_posts WHERE username=%s", (username,))
    rejected = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify({
        "approved": approved,
        "rejected": rejected
    })

# -----------------------------
# Serve React frontend
# -----------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists("frontend/build/" + path):
        return send_from_directory("frontend/build", path)
    else:
        return send_from_directory("frontend/build", "index.html")

# -----------------------------
# Main Entry
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
