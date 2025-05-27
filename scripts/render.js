#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Generate timestamp for filename
function generateTimestamp() {
  const now = new Date();
  
  // Convert to Indian timezone (UTC+5:30)
  const indianTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  // Format: YYYY-MM-DD_HH-mm-ss
  const year = indianTime.getFullYear();
  const month = String(indianTime.getMonth() + 1).padStart(2, '0');
  const day = String(indianTime.getDate()).padStart(2, '0');
  const hours = String(indianTime.getHours()).padStart(2, '0');
  const minutes = String(indianTime.getMinutes()).padStart(2, '0');
  const seconds = String(indianTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Generate audio files for the scene
async function generateAudioFiles(configPathOrType, timestamp) {
  console.log('\n🎵 Generating audio files...\n');
  
  // Create audio output directory
  const audioDir = path.join(__dirname, '..', 'public', 'audio', timestamp);
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  // Build and run audio generation command
  const audioGenCommand = `node -r esbuild-register ${path.join(__dirname, 'generateAudio.ts')} "${configPathOrType}" ${audioDir}`;
  
  try {
    execSync(audioGenCommand, { stdio: 'inherit' });
    console.log('\n✅ Audio generation completed!');
    
    // Create a metadata file with audio durations for Remotion to use
    const metadataPath = path.join(audioDir, 'audio_metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      console.log(`📊 Generated ${metadata.length} audio files with timing data`);
    }
    
    return audioDir;
  } catch (error) {
    console.error('\n⚠️  Audio generation failed:', error.message);
    console.log('Continuing with video render without audio...\n');
    return null;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const composition = args[0] || 'JungleWalk';
const configPathOrType = args[1] || 'deep'; // Can be a path to JSON file or a predefined type
const glFlag = args[2] || '--gl=angle';

// Check if config is a file path or a type
let configType, configPath, configName;
if (configPathOrType.endsWith('.json')) {
  // It's a JSON file path
  configPath = configPathOrType;
  configType = 'custom';
  // Extract config name from filename
  const filename = path.basename(configPath, '.json');
  configName = filename.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
} else {
  // It's a predefined type
  configType = configPathOrType;
  configName = configType === 'deep' ? 'DeepConversation' : 
               configType === 'simple' ? 'SimpleConversation' :
               configType === 'container' ? 'ContainerPhilosophy' : 
               'Custom';
}

// Generate filename with timestamp
const timestamp = generateTimestamp();
const filename = composition === 'CinematicJungleWalk' 
  ? `${configName}_CinematicJungleWalk_${timestamp}.mp4`
  : `${configName}_JungleWalk_${timestamp}.mp4`;

const outputPath = `out/${filename}`;

// Main async function to handle audio generation and rendering
async function main() {
  // Check if OPENAI_API_KEY is set
  if (process.env.OPENAI_API_KEY) {
    // Generate audio files first
    const audioDir = await generateAudioFiles(configPathOrType, timestamp);
    
    // Build props for the config including audio directory
    const propsObj = {
      configType: configType,
      audioTimestamp: timestamp
    };
    
    // If using a JSON config, save it to a temp file and pass the path
    let tempConfigPath = null;
    if (configPath) {
      try {
        const configData = fs.readFileSync(configPath, 'utf-8');
        const jsonConfig = JSON.parse(configData);
        
        // Save to a temp file in public directory
        tempConfigPath = path.join(__dirname, '..', 'public', 'temp-config.json');
        fs.writeFileSync(tempConfigPath, JSON.stringify(jsonConfig));
        propsObj.tempConfigPath = 'temp-config.json';
      } catch (error) {
        console.error(`Failed to load config from ${configPath}:`, error.message);
      }
    }
    
    const props = `--props='${JSON.stringify(propsObj)}'`;
    
    // Build the render command
    const renderCommand = `npx remotion render ${composition} ${outputPath} ${glFlag} ${props}`.trim();
    
    console.log(`\n🎬 Rendering ${composition} to ${outputPath}`);
    console.log(`⚡ Using WebGL: ${glFlag}`);
    console.log(`💬 Config: ${configPath || configType}`);
    console.log(`📅 Timestamp: ${timestamp}`);
    if (audioDir) {
      console.log(`🎵 Audio directory: ${audioDir}`);
    }
    console.log(`🔧 Command: ${renderCommand}\n`);
    
    try {
      // Execute the render command
      execSync(renderCommand, { stdio: 'inherit' });
      console.log(`\n✅ Render completed successfully!`);
      console.log(`📁 Output: ${outputPath}`);
    } catch (error) {
      console.error(`\n❌ Render failed:`, error.message);
      process.exit(1);
    }
  } else {
    console.log('⚠️  OPENAI_API_KEY not found in environment variables');
    console.log('💡 Rendering without audio. To enable audio generation:');
    console.log('   1. Create a .env file in the project root');
    console.log('   2. Add: OPENAI_API_KEY=your_api_key_here\n');
    
    // Build props for the config without audio
    const props = configType !== 'default' 
      ? `--props='{"configType":"${configType}"}'`
      : '';
    
    // Build the render command
    const renderCommand = `npx remotion render ${composition} ${outputPath} ${glFlag} ${props}`.trim();
    
    console.log(`🎬 Rendering ${composition} to ${outputPath}`);
    console.log(`⚡ Using WebGL: ${glFlag}`);
    console.log(`💬 Config: ${configType} conversation`);
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🔧 Command: ${renderCommand}\n`);
    
    try {
      // Execute the render command
      execSync(renderCommand, { stdio: 'inherit' });
      console.log(`\n✅ Render completed successfully!`);
      console.log(`📁 Output: ${outputPath}`);
    } catch (error) {
      console.error(`\n❌ Render failed:`, error.message);
      process.exit(1);
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});