import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { SceneConfig, ConversationSegment } from '../data/sceneConfig';
import { Speaker } from '../components/characters/CharacterAnimations';
import { AudioMetadata, CharacterAudioConfig } from '../types/audio';
const mp3Duration = require('mp3-duration');

export class AudioGenerator {
  private outputDir: string;
  private apiKey: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate speech using OpenAI TTS API
   */
  async generateSpeech(
    text: string,
    filename: string,
    audioConfig: CharacterAudioConfig,
    model: string = 'gpt-4o-mini-tts'
  ): Promise<string | null> {
    try {
      // Prepare request body
      const requestBody: any = {
        model: model,
        input: text,
        voice: audioConfig.voice,
        response_format: 'mp3',
        speed: audioConfig.speed || 1.0
      };

      // Add instructions for gpt-4o-mini-tts model
      if (model === 'gpt-4o-mini-tts' && audioConfig.voiceInstructions) {
        requestBody.instructions = audioConfig.voiceInstructions;
      }

      console.log(`🎤 Generating audio for: "${text.substring(0, 50)}..."`);
      console.log(`   Voice: ${audioConfig.voice}, Model: ${model}`);

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioPath = path.join(this.outputDir, filename);
      
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
      console.log(`✅ Generated: ${filename}`);
      
      return audioPath;
      
    } catch (error: any) {
      console.error(`❌ Error generating ${filename}:`, error.message);
      return null;
    }
  }

  /**
   * Generate audio for all conversations in a scene
   */
  async generateSceneAudio(sceneConfig: SceneConfig): Promise<AudioMetadata[]> {
    if (!sceneConfig.audioSettings?.generateVoiceover) {
      console.log('⏭️  Voiceover generation is disabled for this scene');
      return [];
    }

    const audioMetadata: AudioMetadata[] = [];
    const model = sceneConfig.audioSettings.model || 'gpt-4o-mini-tts';

    console.log('\n🎬 Starting audio generation for scene...\n');

    for (let i = 0; i < sceneConfig.conversation.length; i++) {
      const segment = sceneConfig.conversation[i];
      
      // Skip empty text or NONE speaker
      const speakerValue = typeof segment.speaker === 'string' ? segment.speaker : Speaker[segment.speaker];
      if (!segment.text || speakerValue === 'NONE' || segment.speaker === Speaker.NONE) {
        continue;
      }

      // Determine which character(s) are speaking
      const speakers = this.getSpeakers(segment.speaker, sceneConfig);
      
      for (const { character, characterKey } of speakers) {
        if (!character.audioConfig) {
          console.warn(`⚠️  No audio config for ${character.name}, skipping...`);
          continue;
        }

        const filename = `dialogue_${i + 1}_${characterKey}_${character.name.toLowerCase()}.mp3`;
        const audioPath = await this.generateSpeech(
          segment.text,
          filename,
          character.audioConfig,
          model
        );

        if (audioPath) {
          // Calculate audio duration
          let duration = 0;
          try {
            duration = await mp3Duration(audioPath);
            console.log(`   Duration: ${duration.toFixed(2)}s`);
          } catch (err) {
            console.warn(`   ⚠️  Could not calculate duration for ${filename}`);
          }

          audioMetadata.push({
            filepath: audioPath,
            duration: duration,
            text: segment.text,
            speaker: character.name,
            voice: character.audioConfig.voice
          });

          // Update the segment with the audio source
          segment.audioSrc = audioPath;
        }
      }

      // Add a small delay between API calls to avoid rate limiting
      await this.delay(500);
    }

    console.log(`\n✨ Audio generation complete! Generated ${audioMetadata.length} audio files.\n`);
    
    // Save metadata for reference
    const metadataPath = path.join(this.outputDir, 'audio_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(audioMetadata, null, 2));
    console.log(`📄 Audio metadata saved to: ${metadataPath}`);

    return audioMetadata;
  }

  /**
   * Get the speaking characters based on the speaker type
   */
  private getSpeakers(
    speaker: Speaker | string,
    sceneConfig: SceneConfig
  ): Array<{ character: any; characterKey: string }> {
    const speakers: Array<{ character: any; characterKey: string }> = [];

    if (!sceneConfig.characters) {
      return speakers;
    }

    // Handle both enum and string values
    const speakerValue = typeof speaker === 'string' ? speaker : Speaker[speaker];

    switch (speakerValue) {
      case 'CHARACTER_1':
      case Speaker.CHARACTER_1:
        speakers.push({ 
          character: sceneConfig.characters.character1, 
          characterKey: 'character1' 
        });
        break;
      case 'CHARACTER_2':
      case Speaker.CHARACTER_2:
        speakers.push({ 
          character: sceneConfig.characters.character2, 
          characterKey: 'character2' 
        });
        break;
      case 'BOTH':
      case Speaker.BOTH:
        speakers.push({ 
          character: sceneConfig.characters.character1, 
          characterKey: 'character1' 
        });
        speakers.push({ 
          character: sceneConfig.characters.character2, 
          characterKey: 'character2' 
        });
        break;
    }

    return speakers;
  }

  /**
   * Helper function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up generated audio files
   */
  cleanupAudioFiles(): void {
    try {
      const files = fs.readdirSync(this.outputDir);
      const audioFiles = files.filter(file => file.endsWith('.mp3'));
      
      audioFiles.forEach(file => {
        fs.unlinkSync(path.join(this.outputDir, file));
      });

      console.log(`🧹 Cleaned up ${audioFiles.length} audio files`);
    } catch (error) {
      console.error('Error cleaning up audio files:', error);
    }
  }
}