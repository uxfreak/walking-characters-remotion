#!/usr/bin/env node

import { AudioGenerator } from '../src/services/audioGenerator';
import { deepConversationConfig, simpleConversationConfig, containerConversationConfig, defaultSceneConfig, SceneConfig } from '../src/data/sceneConfig';
import * as fs from 'fs';
import * as path from 'path';

// Get command line arguments
const args = process.argv.slice(2);
const configPathOrType = args[0] || 'deep';
const outputDir = args[1] || './public/audio/temp';

// Load configuration
let sceneConfig: SceneConfig;
let configName: string;

if (configPathOrType.endsWith('.json')) {
  // Load from JSON file
  try {
    const configPath = path.resolve(configPathOrType);
    const configData = fs.readFileSync(configPath, 'utf-8');
    const jsonConfig = JSON.parse(configData);
    
    // Convert speaker strings to enum values
    if (jsonConfig.conversation) {
      jsonConfig.conversation = jsonConfig.conversation.map((seg: any) => ({
        ...seg,
        speaker: seg.speaker // Keep as string, we'll handle conversion in the generator
      }));
    }
    
    sceneConfig = jsonConfig;
    configName = jsonConfig.name || 'Custom Configuration';
  } catch (error: any) {
    console.error(`❌ Failed to load config file: ${configPathOrType}`);
    console.error(error.message);
    process.exit(1);
  }
} else {
  // Use predefined config
  sceneConfig = configPathOrType === 'simple' 
    ? simpleConversationConfig 
    : configPathOrType === 'deep' 
    ? deepConversationConfig
    : configPathOrType === 'container'
    ? containerConversationConfig
    : defaultSceneConfig;
  configName = configPathOrType;
}

// Main function
async function main() {
  console.log(`\n🎭 Generating audio for: ${configName}`);
  console.log(`📁 Output directory: ${outputDir}\n`);

  try {
    // Create audio generator instance
    const audioGenerator = new AudioGenerator(outputDir);
    
    // Generate audio for the scene
    const audioMetadata = await audioGenerator.generateSceneAudio(sceneConfig);
    
    if (audioMetadata.length > 0) {
      console.log(`\n✅ Successfully generated ${audioMetadata.length} audio files!`);
      process.exit(0);
    } else {
      console.log('\n⚠️  No audio files were generated.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Error generating audio:', error.message);
    process.exit(1);
  }
}

// Run the script
main();