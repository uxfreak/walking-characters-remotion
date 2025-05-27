# JSON Configuration Guide

This guide explains how to create custom conversations without modifying any code.

## Quick Start

1. Create a JSON file in the `configs/` directory
2. Run: `node scripts/render.js CinematicJungleWalk configs/your-config.json`

## JSON Structure

```json
{
  "name": "Your Conversation Name",
  "description": "Brief description",
  "cameraSequence": [...],
  "conversation": [...],
  "characters": {...},
  "audioSettings": {...}
}
```

## Camera Shots

Available camera shots:
- `wide` - Both characters visible
- `closeUp` - Close view of both
- `character1Focus` - Focus on first character
- `character2Focus` - Focus on second character
- `overShoulder1` - Over first character's shoulder
- `overShoulder2` - Over second character's shoulder
- `sideProfile` - Side view
- `tracking` - Following movement
- `environment` - Wide scenery shot
- `lowAngle` - Looking up
- `highAngle` - Looking down
- `frontView` - Walking toward camera

## Speakers

Use these values in the conversation:
- `CHARACTER_1` - First character speaks
- `CHARACTER_2` - Second character speaks
- `BOTH` - Both speak together
- `NONE` - No speaker (ambient scene)

## Voice Options

Available voices:
- `onyx` - Deep, authoritative (older male)
- `alloy` - Natural, smooth (young male/neutral)
- `echo` - Articulate, precise (young male)
- `fable` - Warm, engaging (young male)
- `nova` - Bright, energetic (young female)
- `shimmer` - Soft, gentle (young female)

## Example Config

```json
{
  "name": "Morning Walk",
  "description": "Friends discussing their day",
  "cameraSequence": [
    { "shotName": "wide", "start": 0, "end": 150 },
    { "shotName": "character1Focus", "start": 150, "end": 300 },
    { "shotName": "character2Focus", "start": 300, "end": 450 }
  ],
  "conversation": [
    { 
      "start": 0, 
      "end": 150, 
      "speaker": "CHARACTER_1", 
      "text": "Good morning! Ready for our walk?" 
    },
    { 
      "start": 150, 
      "end": 300, 
      "speaker": "CHARACTER_2", 
      "text": "Absolutely! The weather is perfect today." 
    },
    { 
      "start": 300, 
      "end": 450, 
      "speaker": "CHARACTER_1", 
      "text": "Let's explore that new trail!" 
    }
  ],
  "characters": {
    "character1": {
      "name": "Sam",
      "gender": "male",
      "primaryColor": "#3b82f6",
      "secondaryColor": "#1e40af", 
      "hairColor": "#000000",
      "skinTone": "#fdbcb4",
      "audioConfig": {
        "voice": "alloy",
        "voiceInstructions": "Friendly and enthusiastic morning person",
        "speed": 1.0
      }
    },
    "character2": {
      "name": "Alex",
      "gender": "female",
      "primaryColor": "#ec4899",
      "secondaryColor": "#be185d",
      "hairColor": "#fbbf24",
      "skinTone": "#e0ac69",
      "audioConfig": {
        "voice": "nova",
        "voiceInstructions": "Cheerful and energetic, loves nature",
        "speed": 1.0
      }
    }
  },
  "audioSettings": {
    "generateVoiceover": true,
    "model": "gpt-4o-mini-tts",
    "globalSpeed": 1.0
  }
}
```

## Tips

1. **Voice Instructions**: Use these to define personality and speaking style
2. **Speed**: Range from 0.25 to 4.0 (1.0 is normal)
3. **Colors**: Use hex colors (#RRGGBB format)
4. **Timing**: Don't worry about exact frame numbers - the system will adjust based on audio duration!

## Rendering Commands

Standard format:
```bash
node scripts/render.js JungleWalk configs/your-config.json
```

Cinematic format (with letterbox):
```bash
node scripts/render.js CinematicJungleWalk configs/your-config.json
```

The video will be saved in the `out/` directory with a timestamped filename.