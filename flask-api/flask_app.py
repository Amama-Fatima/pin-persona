from flask import Flask, request, jsonify
from model_utils import load_model, build_prompt, generate_keywords

app = Flask(__name__)

REPO_NAME = "Amama02/pinterest-personality-keywords-v2"
tokenizer, model, device = load_model(REPO_NAME)

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        prompt = build_prompt(data)
        result = generate_keywords(model, tokenizer, device, prompt)
        return jsonify({
            "success": True,
            "keywords": result,
            "personality": data.get("personality_name", ""),
            "prompt_used": prompt[:100] + "..."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/")
def health():
    return jsonify({"status": "ok"})
