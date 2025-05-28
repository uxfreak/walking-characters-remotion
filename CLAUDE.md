# Claude Development Notes

This file contains important information for Claude or other AI assistants working on this project.

## Project Overview

Walking Characters Remotion is a 3D animation system that creates videos of characters walking through various environments while having conversations. It uses:
- **Remotion** for programmatic video creation
- **Three.js** for 3D graphics
- **TypeScript** for type safety
- **OpenAI TTS** for AI-generated voiceovers

## Key Components

### 1. Compositions
- **CinematicJungleWalk** - The main composition with letterbox format
- ~~JungleWalk~~ - Deprecated, do not use

### 2. Environments
Currently available environments:
- `jungle` - Lush forest with trees and undergrowth
- `beach` - Sunset beach with ocean, waves, and palm trees
- `snowyForest` - Winter scene with snow effects
- `cherryBlossom` - Japanese-inspired with falling petals
- `desert` - Arid landscape with cacti

### 3. Render Command Pattern

**IMPORTANT**: The correct command pattern is:
```bash
node scripts/render.js CinematicJungleWalk {config-file-path} --gl=angle
```

Examples:
```bash
# With JSON config files
node scripts/render.js CinematicJungleWalk configs/beach-sunset.json --gl=angle
node scripts/render.js CinematicJungleWalk configs/my-video.json --gl=angle

# With built-in presets
node scripts/render.js CinematicJungleWalk deep --gl=angle
node scripts/render.js CinematicJungleWalk simple --gl=angle
```

**DO NOT** use `--configFile=` flag - the config path goes directly after the composition name.

## Recent Updates (May 28, 2025)

### Beach Environment Enhancement
The beach environment now features:
- **Sunset gradient background** - Pink to gold to blue gradient using canvas texture
- **Enhanced materials** - MeshStandardMaterial with proper roughness/metalness
- **Multiple beach sections** - For infinite scrolling (-1, 0, 1 sections)
- **Wet sand areas** - Near the water edge with different material
- **Animated ocean** - Wave vertex animations and foam effects
- **Better palm trees** - Detailed fronds using plane geometry
- **Flying seagulls** - Animated birds circling over the ocean
- **Golden sun** - Emissive sun object in the sky
- **Sunset lighting** - Warm orange directional light with blue fill light

### Command Pattern Update
- Removed all references to non-cinematic `JungleWalk` composition
- Updated README with correct render command pattern
- Fixed package.json scripts to use only `CinematicJungleWalk`

## JSON Configuration Structure

A typical config file should include:

```json
{
  "name": "Video Title",
  "description": "Brief description",
  "environment": "beach",  // or jungle, snowyForest, etc.
  
  "characters": {
    "character1": {
      "name": "Name",
      "gender": "male" | "female",
      "primaryColor": "#hexcolor",
      "secondaryColor": "#hexcolor",
      "hairColor": "#hexcolor",
      "skinTone": "#hexcolor",
      "audioConfig": {
        "voice": "onyx" | "nova" | "alloy" | "echo" | "fable" | "shimmer",
        "voiceInstructions": "Personality and speaking style description",
        "speed": 0.5-2.0
      }
    },
    "character2": { /* same structure */ }
  },
  
  "conversation": [
    { "speaker": "NONE", "text": "" },  // Opening shot
    { "speaker": "CHARACTER_1", "text": "Dialogue here" },
    { "speaker": "CHARACTER_2", "text": "Response here" },
    { "speaker": "BOTH", "text": "Said together" }
  ],
  
  "cameraSequence": [  // Optional, auto-generated if not provided
    { "shotName": "environment", "start": 0, "end": 150 },
    { "shotName": "wide", "start": 150, "end": 300 }
  ],
  
  "audioSettings": {
    "generateVoiceover": true,
    "model": "gpt-4o-mini-tts",
    "globalSpeed": 1.0
  }
}
```

## Environment-Specific Notes

### Beach Environment
- Water is positioned on the right side (x > 15)
- Beach slopes gently down to water
- Palm trees are placed both left (walking path) and right (beach side)
- Waves animate using sine functions
- Background gradient creates sunset atmosphere

### Adding New Environments
1. Create new file in `src/components/environment/`
2. Extend `BaseEnvironment` class
3. Add to `EnvironmentFactory`
4. Define config in `getEnvironmentConfig()`

## Common Issues and Solutions

1. **WebGL Errors**: Normal during rendering, video still generates
2. **Audio Not Found**: Ensure `generateVoiceover: true` in config
3. **Empty Video**: Check that config path doesn't use `--configFile=`
4. **Character Wrong Gender**: Must be exactly "male" or "female"

## Testing Commands

Quick test renders:
```bash
# Test beach environment
node scripts/render.js CinematicJungleWalk configs/beach-demo.json --gl=angle

# Test other environments
node scripts/render.js CinematicJungleWalk configs/snow-test.json --gl=angle
node scripts/render.js CinematicJungleWalk configs/cherry-test.json --gl=angle
node scripts/render.js CinematicJungleWalk configs/desert-test.json --gl=angle
```

## File Organization

```
src/
├── components/
│   ├── characters/       # Character models and animations
│   ├── environment/      # Environment implementations
│   └── scene/           # Scene setup and lighting
├── compositions/        # Video renderers
├── data/               # Configuration and constants
└── services/           # Audio generation
```

## Important Constants

- Frame rate: 30 fps
- Default aspect ratio: 16:9
- Cinematic letterbox: 2.35:1
- Walk speed: Configurable per environment
- Audio timing: Auto-calculated from generated files

## Development Tips

1. Always test with small videos first (few dialogue lines)
2. Use `--gl=swiftshader` if `--gl=angle` fails
3. Check console for audio generation progress
4. Rendered videos go to `out/` directory
5. Audio files are cached in `public/audio/`

## Future Enhancements to Consider

- [ ] More walking animations (running, skipping, etc.)
- [ ] Weather effects (rain in jungle, sandstorm in desert)
- [ ] Time of day variations (morning, noon, sunset, night)
- [ ] More character customization options
- [ ] Background music support
- [ ] Multiple character support (> 2 characters)

---

Last updated: May 28, 2025