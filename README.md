# Walking Characters Remotion

A Three.js-based Remotion project featuring two animated characters walking through a jungle environment with dynamic camera shots and speaker-based animations.

## Features

- 🎬 **Dynamic Camera System**: 14 different camera angles including wide shots, close-ups, over-shoulder views, and more
- 🗣️ **Speaker-Based Animation**: Characters animate differently based on who's speaking
- 🌴 **Rich Jungle Environment**: Procedurally generated trees, mountains, and undergrowth
- 🎥 **Frame-Based Animation**: Fully deterministic animations perfect for video rendering
- 📹 **Multiple Compositions**: Basic and cinematic versions with different camera sequences

## Installation

```bash
npm install
```

## Development

Start the Remotion studio:

```bash
npm start
```

## Building

Render a video (requires WebGL support):

```bash
# Using ANGLE (recommended)
npm run build

# Using SwiftShader (alternative)
npm run build:swiftshader

# Render cinematic version
npm run build:cinematic

# Or use the render script
./render.sh angle JungleWalk out/video.mp4
```

### Troubleshooting WebGL Errors

If you encounter "Error creating WebGL context", use one of these solutions:

1. **Use ANGLE** (recommended): Add `--gl=angle` to your render command
2. **Use SwiftShader**: Add `--gl=swiftshader` to your render command
3. **Use the provided npm scripts** which include the correct flags

Example:
```bash
npx remotion render JungleWalk out/video.mp4 --gl=angle
```

## Project Structure

```
src/
├── components/
│   ├── characters/      # Character models and animations
│   ├── environment/     # Jungle, trees, mountains, etc.
│   ├── controls/        # Camera controls
│   └── scene/          # Scene setup and lighting
├── compositions/        # Remotion compositions
├── constants/          # Materials and camera shots
├── hooks/              # React hooks
└── utils/              # Helper functions
```

## Usage

### Basic Composition

```tsx
<WalkingCharactersScene 
  frame={frame}
  fps={30}
  currentSpeaker={Speaker.CHARACTER_1}
  cameraShot={CameraShots.wide}
/>
```

### Camera Shots

Available camera shots:
- `wide` - Wide establishing shot
- `closeUp` - Close-up on both characters
- `overShoulder1/2` - Over shoulder perspectives
- `character1Focus/2Focus` - Individual character focus
- `sideProfile` - Side view
- `lowAngle/highAngle` - Dramatic angles
- `tracking` - Dynamic tracking shot
- `environment` - Wide environment shot

### Speaker Options

- `Speaker.NONE` - No one speaking
- `Speaker.CHARACTER_1` - First character speaking
- `Speaker.CHARACTER_2` - Second character speaking
- `Speaker.BOTH` - Both characters speaking

## Technologies

- [Remotion](https://www.remotion.dev/) - React-based video creation
- [Three.js](https://threejs.org/) - 3D graphics
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety