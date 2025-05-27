# Walking Characters Remotion Project

A sophisticated 3D walking characters animation system built with Remotion, Three.js, and TypeScript. Create animated videos of characters walking through a jungle while having conversations, with AI-generated voiceovers, customizable appearances, dialogue, and camera movements.

## 🌟 Features

- 🎥 **Dynamic Camera System**: 14 different cinematic shots with smooth transitions
- 🎭 **Customizable Characters**: Configure names, genders, colors, and appearances
- 💬 **Dialogue System**: Add conversations with timed subtitles
- 🗣️ **AI Voiceover**: OpenAI TTS integration with expressive voice personalities
- 🎨 **Gender Variations**: Male and female characters with distinct body proportions
- 🌳 **Jungle Environment**: Trees, mountains, path, and undergrowth
- 📝 **JSON Configuration**: Create videos without coding - just write JSON files
- 🎬 **Multiple Formats**: Standard and cinematic (letterbox) versions
- ⏱️ **Auto-timing**: Automatically calculates video duration from audio files

## 🚀 Quick Start

### Prerequisites

1. **Node.js** version 16 or higher
2. **OpenAI API Key** for voiceover generation

### Setup

```bash
# Clone the repository
git clone https://github.com/uxfreak/walking-characters-remotion.git
cd walking-characters-remotion

# Install dependencies
npm install

# Create .env file for OpenAI API key
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

### Create Your First Video

```bash
# Option 1: Use pre-built examples
node scripts/render.js JungleWalk deep    # Deep philosophical conversation
node scripts/render.js JungleWalk simple  # Simple casual conversation

# Option 2: Use the container philosophy example
node scripts/render.js JungleWalk configs/container-philosophy.json

# Option 3: Create your own JSON config (see below)
node scripts/render.js JungleWalk configs/my-video.json
```

## 📝 Creating Videos with JSON (No Coding Required!)

### Step 1: Create Your JSON Configuration

Create a new file in the `configs/` directory (e.g., `configs/my-story.json`):

```json
{
  "name": "My Amazing Story",
  "description": "A conversation between two friends",
  
  "characters": {
    "character1": {
      "name": "Alex",
      "gender": "male",
      "primaryColor": "#3b82f6",
      "secondaryColor": "#1e40af",
      "hairColor": "#8b4513",
      "skinTone": "#fdbcb4",
      "audioConfig": {
        "voice": "onyx",
        "voiceInstructions": "Friendly and enthusiastic, with a warm tone. Speaks clearly with natural pauses.",
        "speed": 1.0
      }
    },
    "character2": {
      "name": "Sarah",
      "gender": "female",
      "primaryColor": "#ec4899",
      "secondaryColor": "#be185d",
      "hairColor": "#fbbf24",
      "skinTone": "#e0ac69",
      "audioConfig": {
        "voice": "nova",
        "voiceInstructions": "Thoughtful and intelligent, with a curious tone. Speaks with clarity and expressiveness.",
        "speed": 0.95
      }
    }
  },
  
  "conversation": [
    {
      "speaker": "NONE",
      "text": ""
    },
    {
      "speaker": "CHARACTER_1",
      "text": "Hey Sarah! Isn't this jungle path beautiful?"
    },
    {
      "speaker": "CHARACTER_2",
      "text": "It's amazing, Alex! Look at all these ancient trees."
    },
    {
      "speaker": "CHARACTER_1",
      "text": "I heard some of them are hundreds of years old!"
    },
    {
      "speaker": "CHARACTER_2",
      "text": "Imagine all the stories they could tell if they could speak."
    },
    {
      "speaker": "BOTH",
      "text": "Nature is truly wonderful!"
    }
  ],
  
  "audioSettings": {
    "generateVoiceover": true,
    "model": "gpt-4o-mini-tts",
    "globalSpeed": 1.0
  }
}
```

### Step 2: Render Your Video

```bash
node scripts/render.js JungleWalk configs/my-story.json
```

The script will:
1. Generate AI voiceovers for each dialogue line
2. Calculate timing based on audio duration
3. Render the video with synchronized audio and subtitles
4. Save to `out/MyAmazingStory_JungleWalk_[timestamp].mp4`

## 🎙️ Voiceover Configuration

### Available Voices

OpenAI provides 6 voices with different characteristics:

- **alloy**: Neutral and balanced
- **echo**: Warm and conversational  
- **fable**: Expressive and animated
- **onyx**: Deep and authoritative (great for male characters)
- **nova**: Friendly and upbeat (great for female characters)
- **shimmer**: Soft and gentle

### Voice Instructions

Use the `voiceInstructions` field to define personality and speaking style:

```json
"voiceInstructions": "Speak with wonder and curiosity, as if discovering something magical. Use a gentle, dreamy tone with occasional excitement."
```

### Example Voice Personalities

```json
// Wise Elder
"voiceInstructions": "Ancient and wise, speaking slowly with gravitas. Deep pauses between profound statements. Voice of someone who has seen centuries pass."

// Excited Child
"voiceInstructions": "Bursting with energy and wonder! Speak quickly with lots of enthusiasm. Voice rises with excitement at discoveries."

// Mysterious Stranger
"voiceInstructions": "Low, secretive tone with an air of mystery. Speak in riddles and hints, never quite revealing everything."

// Scientific Expert
"voiceInstructions": "Clear, precise pronunciation with academic authority. Measured pace, emphasizing technical terms with confidence."
```

## 📐 Advanced JSON Configuration

### Camera Sequences

Control camera movements throughout your video:

```json
"cameraSequence": [
  { "shotName": "environment", "start": 0, "end": 150 },      // 0-5 seconds
  { "shotName": "wide", "start": 150, "end": 300 },          // 5-10 seconds  
  { "shotName": "character1Focus", "start": 300, "end": 450 }, // 10-15 seconds
  { "shotName": "character2Focus", "start": 450, "end": 600 }, // 15-20 seconds
  { "shotName": "closeUp", "start": 600, "end": 750 }        // 20-25 seconds
]
```

**Available Camera Shots:**
- `environment` - Wide shot of the jungle
- `wide` - Both characters visible
- `closeUp` - Close view of both characters
- `character1Focus` - Focus on first character
- `character2Focus` - Focus on second character
- `overShoulder1` - Over first character's shoulder
- `overShoulder2` - Over second character's shoulder
- `sideProfile` - Side view of characters
- `tracking` - Camera follows movement
- `lowAngle` - Looking up at characters
- `highAngle` - Looking down from above
- `frontView` - Characters walking toward camera

### Auto-Timing vs Manual Timing

**Auto-Timing (Recommended):**
Just write dialogue - timing is calculated from audio:

```json
"conversation": [
  { "speaker": "CHARACTER_1", "text": "Hello!" },
  { "speaker": "CHARACTER_2", "text": "Hi there!" }
]
```

**Manual Timing:**
Specify exact frame timings (30 fps):

```json
"conversation": [
  { "start": 0, "end": 90, "speaker": "CHARACTER_1", "text": "Hello!" },
  { "start": 90, "end": 180, "speaker": "CHARACTER_2", "text": "Hi there!" }
]
```

### Character Customization

```json
"characters": {
  "character1": {
    "name": "Marcus",
    "gender": "male",              // or "female"
    "primaryColor": "#4a5568",     // Shirt color
    "secondaryColor": "#2d3748",   // Pants color
    "hairColor": "#1a202c",        // Hair color
    "skinTone": "#f7fafc",         // Skin tone
    "audioConfig": {
      "voice": "onyx",
      "voiceInstructions": "Your voice personality description here",
      "speed": 0.9               // 0.5 to 2.0 (1.0 is normal)
    }
  }
}
```

**Gender Differences:**
- **Male**: Broader shoulders, thicker arms, shorter hair
- **Female**: Narrower shoulders, longer hair, eyelashes

## 🎬 Example Configurations

### Philosophy Discussion

```json
{
  "name": "Deep Philosophy",
  "conversation": [
    {
      "speaker": "CHARACTER_1",
      "text": "What if reality is just a simulation?"
    },
    {
      "speaker": "CHARACTER_2", 
      "text": "Then does it matter if it feels real to us?"
    }
  ],
  "characters": {
    "character1": {
      "name": "Socrates",
      "audioConfig": {
        "voice": "onyx",
        "voiceInstructions": "Ancient philosopher, speak with wisdom and constant questioning. Thoughtful pauses between ideas."
      }
    }
  }
}
```

### Comedy Sketch

```json
{
  "name": "Jungle Jokes",
  "conversation": [
    {
      "speaker": "CHARACTER_1",
      "text": "Why don't scientists trust atoms?"
    },
    {
      "speaker": "CHARACTER_2",
      "text": "I don't know, why?"
    },
    {
      "speaker": "CHARACTER_1", 
      "text": "Because they make up everything!"
    },
    {
      "speaker": "CHARACTER_2",
      "text": "Oh no, that's terrible! I love it!"
    }
  ],
  "characters": {
    "character1": {
      "name": "Joker",
      "audioConfig": {
        "voice": "fable",
        "voiceInstructions": "Comedic timing is everything! Build up to punchlines with anticipation. Delivered with a mischievous grin in your voice."
      }
    }
  }
}
```

### Educational Content

```json
{
  "name": "Jungle Ecosystem",
  "conversation": [
    {
      "speaker": "CHARACTER_1",
      "text": "Did you know this rainforest produces 20% of Earth's oxygen?"
    },
    {
      "speaker": "CHARACTER_2",
      "text": "That's incredible! How do the trees do it?"
    },
    {
      "speaker": "CHARACTER_1",
      "text": "Through photosynthesis - they convert CO2 into oxygen using sunlight!"
    }
  ],
  "characters": {
    "character1": {
      "name": "Professor",
      "audioConfig": {
        "voice": "echo",
        "voiceInstructions": "Educational and engaging teacher. Clear pronunciation of scientific terms. Enthusiastic about sharing knowledge."
      }
    }
  }
}
```

## 🛠️ Command Line Options

### Basic Rendering

```bash
# Render with JSON config
node scripts/render.js JungleWalk configs/my-video.json

# Render with built-in configs
node scripts/render.js JungleWalk deep
node scripts/render.js JungleWalk simple

# Cinematic mode (letterbox)
node scripts/render.js CinematicJungleWalk configs/my-video.json
```

### Advanced Options

```bash
# Skip voiceover generation (use existing audio)
node scripts/render.js JungleWalk configs/my-video.json --skip-audio

# Custom output location
node scripts/render.js JungleWalk configs/my-video.json --output=my-folder/

# WebGL rendering options (if you have issues)
node scripts/render.js JungleWalk configs/my-video.json --gl=angle
node scripts/render.js JungleWalk configs/my-video.json --gl=swiftshader
```

## 📁 Project Structure

```
walking-characters-remotion/
├── configs/                    # Your JSON video configurations
│   └── container-philosophy.json
├── src/
│   ├── compositions/          # Video renderers
│   ├── components/           # 3D models and animations
│   ├── services/             # Audio generation
│   └── types/                # TypeScript definitions
├── public/
│   └── audio/                # Generated audio files
├── out/                      # Rendered videos
├── scripts/
│   └── render.js            # Main rendering script
└── .env                     # Your OpenAI API key
```

## 🔧 Troubleshooting

### Common Issues

**1. OpenAI API Key Not Working**
```bash
# Check your .env file
cat .env
# Should show: OPENAI_API_KEY=sk-...

# Make sure key has access to gpt-4o-mini-tts model
```

**2. Audio Not Syncing**
- The system automatically syncs based on audio duration
- Check that all dialogue has proper speaker assignments
- Avoid very long sentences (break into multiple lines)

**3. WebGL/Rendering Issues**
```bash
# Try software rendering
node scripts/render.js JungleWalk configs/my-video.json --gl=swiftshader

# Or use ANGLE
node scripts/render.js JungleWalk configs/my-video.json --gl=angle
```

**4. Character Not Showing Correct Gender**
- Ensure gender is set to exactly "male" or "female" in JSON
- Check that you're using the latest version

**5. Video Too Long/Short**
- With voiceover: Duration is automatic based on audio
- Without voiceover: Adjust the speed in audioConfig
- Manual timing: Check frame calculations (30 fps)

## 💡 Tips for Great Videos

1. **Writing Dialogue**
   - Keep sentences conversational and natural
   - Break long thoughts into multiple exchanges
   - Use "BOTH" sparingly for emphasis

2. **Voice Instructions**
   - Be specific about emotion and tone
   - Include pacing guidance (fast, slow, dramatic pauses)
   - Describe the character's personality

3. **Camera Work**
   - Start with establishing shots (environment, wide)
   - Use character focus during important dialogue
   - End with wide or environment shots

4. **Character Design**
   - Choose contrasting colors for the two characters
   - Match voice selection to character appearance
   - Consider personality in color choices

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Submit bug reports
- Suggest new features
- Add new camera shots
- Improve character animations

## 📄 License

ISC License

## 🙏 Credits

- Built with [Remotion](https://www.remotion.dev/) - programmatic video creation
- 3D graphics powered by [Three.js](https://threejs.org/)
- Voiceovers by [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)

---

Made with ❤️ by the Walking Characters team