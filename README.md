# Pin Persona

Pin Persona explores this idea by imagining what Pinterest boards might look like for famous personalities across time. From Roman philosophers to fantasy heroes, the generated boards reflect their ideologies, aesthetics, culture, time period, roles, and life’s work — all through visual keywords optimized for Pinterest.
_If Seneca had a Pinterest board, what would be on it?_

## MODEL TRAINING

### HuggingFace Flan-T5-Base Model

**DATASET**
LoRA fine tuning on a 101 example dataset. Dataset is of the shape:

```json
  {
    "name": "Seneca",
    "culture_region": "Roman",
    "role": "Philosopher",
    "time_period": "Ancient",
    "bio": "Lucius Annaeus Seneca was a Roman Stoic philosopher, statesman, and advisor to Emperor Nero. His writings explore ethics, virtue, and resilience under adversity.",
    "target_text": "roman stoicism, candlelit study, Roman philosophy aesthetic, marble busts, ancient roman libraries, Roman villas, roman statesman aesthetic"
  },
```

**INPUT FORMAT**

The model is prompted with input of the format:

`Generate Pinterest keywords for {name}. Culture: {culture} | Period: {time_period} | Role: {role} | Bio: {bio} Keywords should be visual, searchable on Pinterest, and capture their aesthetic essence. The Culture, Role, Period and bio give important information about the personality. Take them into account when generating keywords.`

and it outputs a list of pinterest specific keywords related to that personality.
