#!/bin/bash

# Render script for Walking Characters Remotion project
# This script ensures proper WebGL support for Three.js rendering

echo "🎬 Starting Remotion render with WebGL support..."

# Check if output directory exists
mkdir -p out

# Default to angle for better compatibility
GL_MODE=${1:-angle}
COMPOSITION=${2:-JungleWalk}
OUTPUT=${3:-out/video.mp4}

echo "📹 Rendering composition: $COMPOSITION"
echo "🎯 Output: $OUTPUT"
echo "🖥️  GL Mode: $GL_MODE"

# Run the render command with proper flags
npx remotion render \
  $COMPOSITION \
  $OUTPUT \
  --gl=$GL_MODE \
  --log=verbose

echo "✅ Rendering complete!"