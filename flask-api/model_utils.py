import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

def load_model(repo_name: str):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(repo_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(repo_name).to(device)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    if model.config.decoder_start_token_id is None:
        model.config.decoder_start_token_id = tokenizer.pad_token_id

    return tokenizer, model, device

def build_prompt(data: dict) -> str:
    parts = [f"Generate Pinterest keywords for {data.get('personality_name', '')}"]
    context = []

    if data.get("culture"):
        context.append(f"Culture: {data['culture']}")
    if data.get("role"):
        context.append(f"Role: {data['role']}")
    if data.get("period"):
        context.append(f"Period: {data['period']}")
    if data.get("bio"):
        context.append(f"Bio: {data['bio']}")

    if context:
        parts.append(" | ".join(context))

    parts.append("Keywords should be visual, searchable on Pinterest, and capture their aesthetic essence. The Culture, Role, Period and bio give important information about the personality. Take them into account when generating keywords")

    return " - ".join(parts)

def generate_keywords(model, tokenizer, device, prompt: str) -> str:
    inputs = tokenizer(prompt, return_tensors="pt", max_length=256, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=300,
            num_beams=8,
            temperature=0.9,
            do_sample=True,
            top_p=0.95,
            repetition_penalty=2.0,
            length_penalty=1.2,
            early_stopping=True,
            no_repeat_ngram_size=2,
            pad_token_id=tokenizer.pad_token_id,
            decoder_start_token_id=model.config.decoder_start_token_id,
        )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)
