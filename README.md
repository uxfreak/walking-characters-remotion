# Walking Characters Remotion Project

A sophisticated 3D walking characters animation system built with Remotion, Three.js, and TypeScript. Features dynamic camera systems, deterministic environment generation, and audio-driven content timing.

## Features

- 🎥 **Dynamic Camera System**: 14 different cinematic shots with smooth transitions
- 🎭 **Speaker-Based Animations**: Characters respond based on who's speaking with mouth animations and head tracking
- 🌳 **Deterministic Environment**: Trees, mountains, and undergrowth with stable, glitch-free rendering
- 🎵 **Audio-Driven Duration**: Use `calculateMetadata` to automatically adjust video length based on audio files
- 📅 **Timestamp Filenames**: Indian timezone timestamps in output filenames
- 🎬 **Two Compositions**: Standard and cinematic versions with letterbox effects

## Quick Start

```bash
# Install dependencies
npm install

# Start development studio
npm start

# Render standard version
npm run build

# Render cinematic version
npm run build:cinematic
```

## Project Structure

```
src/
├── compositions/           # Main video compositions
│   ├── JungleWalk.tsx     # Standard version
│   └── CinematicJungleWalk.tsx # Cinematic version with letterbox
├── data/                  # Configuration and data
│   ├── sceneConfig.ts     # Default scene configuration
│   └── *.json             # Legacy JSON configs (deprecated)
├── utils/
│   ├── metadataCalculator.ts # calculateMetadata implementation
│   └── dataLoader.ts      # Legacy data loading (deprecated)
├── components/
│   ├── characters/        # Character models and animations
│   ├── environment/       # Trees, mountains, path, undergrowth
│   ├── scene/            # Scene setup and lighting
│   └── controls/         # Camera controls
└── constants/
    ├── cameraShots.ts    # Camera shot definitions
    └── materials.ts      # Three.js materials
```

## Configuration System

### Using calculateMetadata (Recommended)

The project uses Remotion's `calculateMetadata` API for dynamic video configuration:

```typescript
// Example: Creating a video with custom audio
const myConfig: SceneConfig = {
  conversation: [
    { 
      start: 0, 
      end: 0, // Will be calculated from audio
      speaker: Speaker.CHARACTER_1, 
      text: "Hello world!",
      audioSrc: "path/to/audio1.mp3" // Duration auto-calculated
    },
    // ... more segments
  ],
  cameraSequence: [
    { shotName: 'wide', start: 0, end: 0 }, // Auto-calculated
    // ... more shots
  ]
};
```

### Audio-Driven Duration

When you provide `audioSrc` for conversation segments, the system automatically:
1. Parses each audio file using `@remotion/media-parser`
2. Calculates total video duration
3. Adjusts camera sequence timing proportionally
4. Updates conversation segment timing

### Background Audio

Set background audio that determines the total video length:

```typescript
// In your render command or composition props
{
  backgroundAudio: "path/to/background.mp3",
  sceneConfig: myConfig
}
```

## Camera Shots

14 predefined camera shots available:

- `wide` - Wide establishing shot
- `closeUp` - Close-up of both characters  
- `character1Focus` - Focus on character 1
- `character2Focus` - Focus on character 2
- `sideProfile` - Side view of characters
- `overShoulder1` / `overShoulder2` - Over-shoulder shots
- `tracking` - Dynamic tracking shot
- `lowAngle` / `highAngle` - Dramatic angle shots
- `frontView` - Characters approaching camera
- `environment` - Environment showcase

## Character Animation

### Speaker System

Characters automatically animate based on the current speaker:

```typescript
enum Speaker {
  NONE = 'none',           // No one speaking
  CHARACTER_1 = 'character1',  // Character 1 speaking  
  CHARACTER_2 = 'character2',  // Character 2 speaking
  BOTH = 'both'            // Both speaking
}
```

- **Speaker**: Mouth animations, gestures
- **Listener**: Head tracking, attention poses
- **Both**: Synchronized movements

## Rendering Options

### Standard Commands

```bash
# Standard version with timestamp
npm run build

# Cinematic version with letterbox
npm run build:cinematic

# Alternative WebGL backend
npm run build:swiftshader
npm run build:cinematic:swiftshader
```

### Custom Rendering

```bash
# Direct command with custom options
npx remotion render JungleWalk out/custom.mp4 --gl=angle --props='{"backgroundAudio":"audio.mp3"}'
```

### Output Filenames

Files are automatically named with Indian timezone timestamps:
- `JungleWalk_2025-05-27_04-55-54.mp4`
- `CinematicJungleWalk_2025-05-27_04-55-54.mp4`

## Environment System

### Deterministic Generation

All environment elements use seeded random generation to prevent glitches:

- **Trees**: 3 types (tall jungle, broad jungle, vine-covered)
- **Mountains**: 3 distance layers with parallax
- **Undergrowth**: Bushes and ferns
- **Path**: Looping stone path segments

### Performance

- Optimized for headless rendering with `--gl=angle`
- Deterministic positioning prevents frame-by-frame regeneration
- Reduced video file sizes due to stable rendering

## Development

### Adding New Audio

1. Place audio files in your project
2. Update scene configuration:

```typescript
const conversation = [
  {
    speaker: Speaker.CHARACTER_1,
    text: "New dialogue",
    audioSrc: "./audio/new-audio.mp3" // Auto-calculated duration
  }
];
```

3. The system automatically calculates timing

### Custom Camera Shots

Add new shots to `src/constants/cameraShots.ts`:

```typescript
export const CameraShots = {
  myNewShot: {
    name: 'My New Shot',
    position: new THREE.Vector3(x, y, z),
    target: new THREE.Vector3(x, y, z),
    fov: 60
  }
};
```

### Environment Customization

Modify environment generation in `src/data/sceneConfig.ts` or create custom scene configurations.

## Technical Details

- **Framework**: Remotion 4.x
- **3D Engine**: Three.js
- **Language**: TypeScript
- **Audio Processing**: @remotion/media-parser
- **Rendering**: WebGL with fallback options

## Troubleshooting

### WebGL Issues
```bash
# Try alternative WebGL backend
npm run build:swiftshader
```

### Audio Problems
- Ensure audio files are accessible
- Check console for parseMedia errors
- Verify audio file formats are supported

### Performance Issues
- Use `--gl=angle` for better WebGL support
- Reduce scene complexity if needed
- Check deterministic generation is working

## License

ISC License