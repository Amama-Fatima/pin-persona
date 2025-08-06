# Pin Persona

Pin Persona explores how historical and cultural figures might be represented visually on Pinterest. It generates keyword phrases that reflect a personality’s aesthetic, culture, role, time period, and biographical context — optimized for Pinterest-style search and discovery.

_If Seneca had a Pinterest board, what would be on it?_

## Live Demo

- 🔗 Website: [https://pin-persona.vercel.app](https://pin-persona-amycxgohh-amamafatima58gmailcoms-projects.vercel.app/)
- 🚀 Model on Hugging Face: [pinterest-personality-keywords-v3](https://huggingface.co/pinterest-personality-keywords-v3)
- 🛠️ API Space: [pinterest-persona-api](https://huggingface.co/spaces/pinterest-persona-api)

## How It Works (Frontend Workflow)

1. The user enters the name of a famous personality.
2. The app fetches metadata:
   - role
   - culture_region
   - time_period
   - bio
3. These fields are sent to the **Hugging Face Space API**, which runs the fine-tuned T5 model.
4. The model returns Pinterest-style keywords representing the personality's visual aesthetic.
5. For each keyword, the app uses **Puppeteer** to scrape Pinterest and fetch related images.
6. Five random images per keyword are displayed to the user, forming a Pinterest board.

## MODEL TRAINING

### Base Model

Fine-tuned on google/flan-t5-base using LoRA (Low-Rank Adaptation) for efficient parameter updates.

### Dataset

The training set consists of 101 curated examples in the following structure:

```json
{
  "name": "Seneca",
  "culture_region": "Roman",
  "role": "Philosopher, Statesman",
  "time_period": "Ancient",
  "bio": "Lucius Annaeus Seneca was a Roman Stoic philosopher, statesman, and advisor to Emperor Nero. His writings explore ethics, virtue, and resilience under adversity.",
  "target_text": "roman stoicism moodboard, candlelit study theme, Roman philosophy aesthetic, marble busts visual, ancient roman libraries core, roman statesman aesthetic"
}
```

The `target_text` field contains the expected Pinterest-style keywords for the given personality.

### Inference Format

During inference, the model is prompted with a structured input in natural language, using the following format:

```text
Generate Pinterest keywords for {name}. Culture: {culture} | Period: {time_period} | Role: {role} | Bio: {bio} Keywords should be visual, searchable on Pinterest, and capture their aesthetic essence. The Culture, Role, Period and bio give important information about the personality. Take them into account when generating keywords.
```

#### Example Prompt

```text
Generate Pinterest keywords for Seneca. Culture: Roman | Period: Ancient | Role: Philosopher, Statesman | Bio: Lucius Annaeus Seneca was a Roman Stoic philosopher, statesman, and advisor to Emperor Nero. His writings explore ethics, virtue, and resilience under adversity. Keywords should be visual, searchable on Pinterest, and capture their aesthetic essence. The Culture, Role, Period and bio give important information about the personality. Take them into account when generating keywords.
```

#### Example Output

```text
roman stoicism moodboard, candlelit study theme, Roman philosophy aesthetic, marble busts visual, ancient roman libraries core, roman statesman aesthetic
```
