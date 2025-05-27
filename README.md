# Walking Characters Remotion Project

A sophisticated 3D walking characters animation system built with Remotion, Three.js, and TypeScript. Create animated videos of characters walking through a jungle while having conversations, with customizable appearances, dialogue, and camera movements.

## Features

- 🎥 **Dynamic Camera System**: 14 different cinematic shots with smooth transitions
- 🎭 **Customizable Characters**: Configure names, genders, colors, and appearances
- 💬 **Dialogue System**: Add conversations with timed subtitles
- 🎨 **Gender Variations**: Male and female characters with distinct body proportions and features
- 🌳 **Jungle Environment**: Trees, mountains, path, and undergrowth
- 🎵 **Audio Support**: Sync dialogue with audio files (future implementation ready)
- 📅 **Timestamp Filenames**: Automatic Indian timezone timestamps
- 🎬 **Multiple Formats**: Standard and cinematic (letterbox) versions

## Quick Start

```bash
# Clone the repository
git clone https://github.com/uxfreak/walking-characters-remotion.git
cd walking-characters-remotion

# Install dependencies
npm install

# Start development studio (preview your videos)
npm start

# Render a video with pre-configured conversations
node scripts/render.js JungleWalk deep    # Deep philosophical conversation
node scripts/render.js JungleWalk simple  # Simple casual conversation
```

## 🎬 Creating Your Own Video - Step by Step

### Step 1: Open the Configuration File
Open `src/data/sceneConfig.ts` in your code editor.

### Step 2: Create Your Scene Configuration
Add a new configuration object. Here's a template:

```typescript
export const myVideoConfig: SceneConfig = {
  // Define camera movements
  cameraSequence: [
    { shotName: 'wide', start: 0, end: 150 },          // 0-5 seconds
    { shotName: 'character1Focus', start: 150, end: 300 }, // 5-10 seconds
    { shotName: 'character2Focus', start: 300, end: 450 }, // 10-15 seconds
    { shotName: 'closeUp', start: 450, end: 600 }      // 15-20 seconds
  ],
  
  // Write your dialogue
  conversation: [
    { 
      start: 0, 
      end: 150, 
      speaker: Speaker.CHARACTER_1, 
      text: 'Hey! Beautiful day for a walk!' 
    },
    { 
      start: 150, 
      end: 300, 
      speaker: Speaker.CHARACTER_2, 
      text: 'Absolutely! I love the fresh air.' 
    },
    { 
      start: 300, 
      end: 450, 
      speaker: Speaker.CHARACTER_1, 
      text: 'Look at those mountains in the distance!' 
    },
    { 
      start: 450, 
      end: 600, 
      speaker: Speaker.CHARACTER_2, 
      text: 'Stunning! Nature is amazing.' 
    }
  ],
  
  // Customize your characters
  characters: {
    character1: {
      name: 'Alex',
      gender: 'male',              // 'male' or 'female'
      primaryColor: '#3b82f6',     // Shirt color (blue)
      secondaryColor: '#1e40af',   // Pants color (dark blue)
      hairColor: '#8b4513',        // Hair color (brown)
      skinTone: '#fdbcb4'          // Skin tone
    },
    character2: {
      name: 'Emma',
      gender: 'female',
      primaryColor: '#ec4899',     // Shirt color (pink)
      secondaryColor: '#be185d',   // Pants color (dark pink)
      hairColor: '#fbbf24',        // Hair color (blonde)
      skinTone: '#e0ac69'          // Skin tone
    }
  }
};
```

### Step 3: Update the Metadata Calculator
In `src/utils/metadataCalculator.ts`, add your config to the selection logic:

```typescript
const baseConfig = props.configType === 'simple' 
  ? simpleConversationConfig 
  : props.configType === 'deep' 
  ? deepConversationConfig
  : props.configType === 'myVideo'  // Add this line
  ? myVideoConfig                    // Add this line
  : defaultSceneConfig;
```

### Step 4: Update the Render Script (Optional)
If you want a custom prefix for your video, edit `scripts/render.js`:

```javascript
const configPrefix = configType === 'deep' ? 'DeepConversation_' : 
                    configType === 'simple' ? 'SimpleConversation_' :
                    configType === 'myVideo' ? 'MyCustom_' :  // Add this
                    '';
```

### Step 5: Render Your Video
```bash
node scripts/render.js JungleWalk myVideo
```

Your video will be saved as: `out/MyCustom_JungleWalk_2025-05-27_XX-XX-XX.mp4`

## 📐 Configuration Reference

### Frame Timing Guide
- **Frame Rate**: 30 fps (frames per second)
- **Time Calculations**:
  - 1 second = 30 frames
  - 3 seconds = 90 frames
  - 5 seconds = 150 frames
  - 10 seconds = 300 frames
  - 30 seconds = 900 frames
  - 1 minute = 1800 frames

### Available Camera Shots
- `wide` - Both characters visible, wide view
- `closeUp` - Close view of both characters
- `character1Focus` - Focus on first character
- `character2Focus` - Focus on second character
- `overShoulder1` - Over first character's shoulder
- `overShoulder2` - Over second character's shoulder
- `sideProfile` - Side view of characters
- `tracking` - Camera follows movement
- `environment` - Wide shot showing scenery
- `lowAngle` - Looking up at characters
- `highAngle` - Looking down from above
- `frontView` - Characters walking toward camera

### Speaker Options
- `Speaker.CHARACTER_1` - First character speaks
- `Speaker.CHARACTER_2` - Second character speaks
- `Speaker.BOTH` - Both speak together
- `Speaker.NONE` - No one speaks (ambient scene)

### Character Customization
- **Gender**: `'male'` or `'female'`
  - Males: Broader shoulders, thicker arms
  - Females: Narrower shoulders, longer hair, eyelashes
- **Colors**: Use hex color codes (#RRGGBB)
  - Popular shirt colors: `#3b82f6` (blue), `#ef4444` (red), `#10b981` (green)
  - Popular hair colors: `#000000` (black), `#8b4513` (brown), `#fbbf24` (blonde)

## 🎨 Pre-built Configurations

The project includes two ready-to-use configurations:

### 1. Deep Conversation (`deep`)
- **Characters**: Alex (male, blue) & Maya (female, red)
- **Topic**: Philosophy, time, consciousness
- **Duration**: 39 seconds
- **Mood**: Thoughtful, profound

### 2. Simple Conversation (`simple`)
- **Characters**: Tom (male, green) & Sarah (female, purple)
- **Topic**: Casual walk, reminiscing
- **Duration**: 30 seconds
- **Mood**: Light, friendly

## Project Structure

```
src/
├── data/
│   └── sceneConfig.ts     # WHERE YOU CREATE YOUR VIDEOS
├── compositions/          # Video renderers
├── components/
│   ├── characters/        # Character models
│   └── environment/       # Jungle scenery
├── constants/
│   └── cameraShots.ts    # Camera positions
└── utils/
    └── metadataCalculator.ts # Config selector
```

## 💡 Example Configurations

### Example 1: Comedy Skit
```typescript
export const comedyConfig: SceneConfig = {
  cameraSequence: [
    { shotName: 'wide', start: 0, end: 90 },
    { shotName: 'closeUp', start: 90, end: 180 },
    { shotName: 'character1Focus', start: 180, end: 270 },
    { shotName: 'character2Focus', start: 270, end: 360 }
  ],
  conversation: [
    { start: 0, end: 90, speaker: Speaker.CHARACTER_1, text: 'Why did the chicken cross the road?' },
    { start: 90, end: 180, speaker: Speaker.CHARACTER_2, text: 'I don\'t know, why?' },
    { start: 180, end: 270, speaker: Speaker.CHARACTER_1, text: 'To get to the other side!' },
    { start: 270, end: 360, speaker: Speaker.CHARACTER_2, text: 'That\'s the oldest joke ever!' }
  ],
  characters: {
    character1: {
      name: 'Joker',
      gender: 'male',
      primaryColor: '#f59e0b',  // Orange
      secondaryColor: '#d97706',
      hairColor: '#ef4444',     // Red hair
      skinTone: '#fdbcb4'
    },
    character2: {
      name: 'Lily',
      gender: 'female',
      primaryColor: '#8b5cf6',  // Purple
      secondaryColor: '#7c3aed',
      hairColor: '#ec4899',     // Pink hair
      skinTone: '#e0ac69'
    }
  }
};
```

### Example 2: Educational Content
```typescript
export const educationalConfig: SceneConfig = {
  cameraSequence: [
    { shotName: 'wide', start: 0, end: 180 },
    { shotName: 'environment', start: 180, end: 360 },
    { shotName: 'sideProfile', start: 360, end: 540 }
  ],
  conversation: [
    { start: 0, end: 180, speaker: Speaker.CHARACTER_1, text: 'Did you know trees produce oxygen through photosynthesis?' },
    { start: 180, end: 360, speaker: Speaker.CHARACTER_2, text: 'Yes! And this jungle produces 20% of Earth\'s oxygen.' },
    { start: 360, end: 540, speaker: Speaker.BOTH, text: 'We must protect our forests!' }
  ],
  characters: {
    character1: {
      name: 'Professor Oak',
      gender: 'male',
      primaryColor: '#059669',  // Green (nature theme)
      secondaryColor: '#047857',
      hairColor: '#6b7280',     // Gray hair
      skinTone: '#fdbcb4'
    },
    character2: {
      name: 'Student Maya',
      gender: 'female',
      primaryColor: '#0ea5e9',  // Sky blue
      secondaryColor: '#0284c7',
      hairColor: '#78350f',     // Dark brown
      skinTone: '#deb887'
    }
  }
};
```

## 🚀 Advanced Features

### Cinematic Mode
Create letterbox videos for a film-like appearance:
```bash
node scripts/render.js CinematicJungleWalk deep
```

### WebGL Rendering Options
If you encounter rendering issues:
```bash
# Use SwiftShader (software rendering)
node scripts/render.js JungleWalk deep --gl=swiftshader

# Use ANGLE (recommended)
node scripts/render.js JungleWalk deep --gl=angle
```

### Preview in Development Studio
```bash
npm start
# Then navigate to http://localhost:3000
# Select "JungleWalk" composition
# Use the timeline to preview your video
```

## 🎭 Character Animation Details

When a character speaks:
- **Mouth** animates (open/close)
- **Arms** gesture naturally
- **Head** tilts slightly

When listening:
- **Head** turns toward speaker
- **Body** shifts attention
- **Subtle idle animations** continue

## 🌳 Environment Features

The jungle environment includes:
- **Dynamic Trees**: Tall trees, broad canopy trees, vine-covered trees
- **Mountain Backdrop**: Three layers with parallax effect
- **Walking Path**: Stone path that loops seamlessly
- **Undergrowth**: Bushes and ferns along the path
- **Lighting**: Warm sunlight filtering through trees

## 📝 Tips for Great Videos

1. **Dialogue Pacing**: Allow 3-5 seconds per line of dialogue
2. **Camera Variety**: Mix wide shots with close-ups
3. **Character Colors**: Choose contrasting colors for visibility
4. **Scene Length**: 20-40 seconds works best
5. **Natural Conversation**: Write dialogue as people actually speak

## 🛠 Technical Requirements

- **Node.js**: Version 16 or higher
- **System**: Works on Windows, macOS, Linux
- **GPU**: Recommended for faster rendering
- **RAM**: 4GB minimum, 8GB recommended

## 🔧 Troubleshooting

### Common Issues

1. **"WebGL not supported" error**
   ```bash
   # Use software rendering
   node scripts/render.js JungleWalk deep --gl=swiftshader
   ```

2. **Slow rendering**
   - Close other applications
   - Use `--concurrency=1` for less RAM usage
   - Render at lower resolution if needed

3. **Characters not showing colors**
   - Ensure hex colors include the # symbol
   - Check color format: `#RRGGBB`

4. **Video appears too fast/slow**
   - Check frame calculations (30fps)
   - Ensure start/end frames don't overlap

## 📄 License

ISC License

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Made with ❤️ using Remotion and Three.js