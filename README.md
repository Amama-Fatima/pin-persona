# Pin Persona

Pin Persona explores how historical and cultural figures might be represented visually on Pinterest. It generates keyword phrases that reflect a personality’s aesthetic, culture, role, time period, and biographical context — optimized for Pinterest-style search and discovery.


## Live Demo

- 🔗 Website: [https://pin-persona.vercel.app](https://pin-persona.vercel.app/)
- 🚀 Model on Hugging Face: [pinterest-personality-keywords-25-August](https://huggingface.co/Amama02/pinterest-personality-keywords-25-August)
- 🛠️ API Space: [pinterest-persona-api](https://huggingface.co/spaces/Amama02/pin-persona-25-august)

  https://github.com/user-attachments/assets/8ebe4cbb-ed61-49d6-9248-6818e39a89cd

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
    "role": "Stoic Philosopher, Roman Statesman",
    "time_period": "Roman Empire, 1st Century CE",
    "bio": "Lucius Annaeus Seneca was a Roman Stoic philosopher, statesman, and advisor to Emperor Nero. He wrote on topics like ethics, virtue, and resilience. His writings include moral letters, tragedies, and philosophical treatises that influenced both ancient and modern thought.",
    "target_text": "roman empire aesthetics, stoic philosophy aesthetics, roman stoicism aesthetics, 1st century rome aesthetics, roman statesman aesthetics, seneca     philosophy aesthetics, roman ethics aesthetics, stoic writings aesthetics, classical philosophy aesthetics"
  }
```

The `target_text` field contains the expected Pinterest-style keywords for the given personality.


