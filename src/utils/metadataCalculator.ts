import { CalculateMetadataFunction, staticFile } from 'remotion';
import { parseMedia } from '@remotion/media-parser';
import { SceneConfig, ConversationSegment, CameraSequenceItem, defaultSceneConfig, deepConversationConfig, simpleConversationConfig, containerConversationConfig } from '../data/sceneConfig';
import { Speaker } from '../components/characters/CharacterAnimations';

export interface JungleWalkProps {
  sceneConfig?: SceneConfig;
  fps?: number;
  width?: number;
  height?: number;
  backgroundAudio?: string;
  configType?: 'default' | 'deep' | 'simple' | 'container' | 'custom';
  tempConfigPath?: string; // Path to temp JSON config file in public
  audioTimestamp?: string; // Timestamp for audio files directory
}

// Calculate dynamic duration based on audio files or conversation timing
export const calculateJungleWalkMetadata: CalculateMetadataFunction<JungleWalkProps> = async ({
  props,
  abortSignal,
}) => {
  const fps = props.fps || 30;
  let totalDurationInFrames = 900; // Default 30 seconds
  
  // Select the appropriate config
  let baseConfig: SceneConfig;
  
  // If tempConfigPath is provided, load from that file
  if (props.tempConfigPath) {
    try {
      const response = await fetch(staticFile(props.tempConfigPath));
      const jsonConfig = await response.json();
      baseConfig = jsonConfig;
      
      // Convert speaker strings to proper format if needed
      if (baseConfig.conversation) {
        baseConfig.conversation = baseConfig.conversation.map((seg: any) => ({
          ...seg,
          speaker: typeof seg.speaker === 'string' ? seg.speaker : Speaker[seg.speaker]
        }));
      }
    } catch (error) {
      console.error(`Failed to load config from ${props.tempConfigPath}, using default`);
      baseConfig = defaultSceneConfig;
    }
  } else if (props.sceneConfig) {
    // If sceneConfig is directly provided, use it
    baseConfig = props.sceneConfig;
    
    // Convert speaker strings to proper format if needed
    if (baseConfig.conversation) {
      baseConfig.conversation = baseConfig.conversation.map((seg: any) => ({
        ...seg,
        speaker: typeof seg.speaker === 'string' ? seg.speaker : Speaker[seg.speaker]
      }));
    }
  } else {
    // Use predefined config based on configType
    baseConfig = props.configType === 'simple' 
      ? simpleConversationConfig 
      : props.configType === 'deep' 
      ? deepConversationConfig
      : props.configType === 'container'
      ? containerConversationConfig
      : defaultSceneConfig;
  }
  
  const sceneConfig = baseConfig;
  
  // If backgroundAudio is provided, use its duration
  if (props.backgroundAudio) {
    try {
      const result = await parseMedia({
        src: props.backgroundAudio,
        fields: {
          durationInSeconds: true,
        },
        signal: abortSignal,
      });
      
      if (result.durationInSeconds) {
        totalDurationInFrames = Math.ceil(result.durationInSeconds * fps);
      }
    } catch (error) {
      console.warn('Failed to parse background audio duration:', error);
    }
  }
  
  // Calculate conversation and camera sequence timing based on audio segments
  let processedConfig = sceneConfig;
  
  if (sceneConfig?.conversation) {
    let cumulativeTime = 0;
    const processedConversation: ConversationSegment[] = [];
    
    for (let i = 0; i < sceneConfig.conversation.length; i++) {
      const segment = sceneConfig.conversation[i];
      let segmentDuration = 90; // Default 3 seconds per segment
      let audioPath = segment.audioSrc;
      
      // If audio timestamp is provided, try to find the generated audio file
      const speakerValue = typeof segment.speaker === 'string' ? segment.speaker : Speaker[segment.speaker];
      if (props.audioTimestamp && segment.text && speakerValue !== 'NONE' && segment.speaker !== Speaker.NONE) {
        const speakerIndex = (speakerValue === 'CHARACTER_1' || segment.speaker === Speaker.CHARACTER_1) ? 'character1' : 
                           (speakerValue === 'CHARACTER_2' || segment.speaker === Speaker.CHARACTER_2) ? 'character2' : 
                           null;
        
        if (speakerIndex && sceneConfig.characters) {
          const character = sceneConfig.characters[speakerIndex];
          const audioFilename = `dialogue_${i + 1}_${speakerIndex}_${character.name.toLowerCase()}.mp3`;
          // Use absolute path for parseMedia
          audioPath = `public/audio/${props.audioTimestamp}/${audioFilename}`;
        }
        
        // For BOTH speakers, we need to handle two audio files
        if ((speakerValue === 'BOTH' || segment.speaker === Speaker.BOTH) && sceneConfig.characters) {
          // For now, use character1's audio duration as the reference
          const audioFilename = `dialogue_${i + 1}_character1_${sceneConfig.characters.character1.name.toLowerCase()}.mp3`;
          audioPath = `public/audio/${props.audioTimestamp}/${audioFilename}`;
        }
      }
      
      // If audio file is provided for this segment, use its duration
      if (audioPath) {
        try {
          const result = await parseMedia({
            src: audioPath,
            fields: {
              durationInSeconds: true,
            },
            signal: abortSignal,
          });
          
          if (result.durationInSeconds) {
            segmentDuration = Math.ceil(result.durationInSeconds * fps);
          }
        } catch (error) {
          console.warn(`Failed to parse audio for segment: ${segment.text}`, error);
        }
      }
      
      // Convert path for use in components
      let componentAudioPath = audioPath;
      if (audioPath && audioPath.startsWith('public/')) {
        // Convert to path that staticFile can use
        componentAudioPath = audioPath.replace('public/', '');
      }
      
      processedConversation.push({
        ...segment,
        start: cumulativeTime,
        end: cumulativeTime + segmentDuration,
        audioSrc: componentAudioPath || segment.audioSrc,
      });
      
      // Add a small buffer between dialogues for natural pacing
      const bufferFrames = Math.floor(0.5 * fps); // 0.5 second buffer
      cumulativeTime += segmentDuration + bufferFrames;
    }
    
    // Update total duration based on conversation length if no background audio
    if (!props.backgroundAudio) {
      totalDurationInFrames = cumulativeTime;
    }
    
    // Adjust camera sequence to match conversation timing
    const processedCameraSequence: CameraSequenceItem[] = [];
    
    // Calculate proportional durations for camera shots based on original timing
    const originalTotalDuration = sceneConfig.cameraSequence[sceneConfig.cameraSequence.length - 1].end;
    const scaleFactor = totalDurationInFrames / originalTotalDuration;
    
    sceneConfig.cameraSequence.forEach((shot, index) => {
      const scaledStart = Math.floor(shot.start * scaleFactor);
      const scaledEnd = index === sceneConfig.cameraSequence.length - 1 
        ? totalDurationInFrames 
        : Math.floor(shot.end * scaleFactor);
        
      processedCameraSequence.push({
        ...shot,
        start: scaledStart,
        end: scaledEnd,
      });
    });
    
    processedConfig = {
      ...sceneConfig,
      conversation: processedConversation,
      cameraSequence: processedCameraSequence,
    };
  }
  
  return {
    durationInFrames: totalDurationInFrames,
    fps,
    width: props.width || 1920,
    height: props.height || 1080,
    props: {
      ...props,
      sceneConfig: processedConfig,
      calculatedDuration: totalDurationInFrames / fps,
    },
  };
};

// Utility functions to get data from processed config
export const getSpeakerAtFrame = (frame: number, conversation: ConversationSegment[]): Speaker => {
  const segment = conversation.find(
    seg => frame >= seg.start && frame < seg.end
  );
  if (!segment) return Speaker.NONE;
  
  // Handle string speaker values from JSON
  if (typeof segment.speaker === 'string') {
    switch (segment.speaker) {
      case 'CHARACTER_1': return Speaker.CHARACTER_1;
      case 'CHARACTER_2': return Speaker.CHARACTER_2;
      case 'BOTH': return Speaker.BOTH;
      case 'NONE': return Speaker.NONE;
      default: return Speaker.NONE;
    }
  }
  
  return segment.speaker;
};

export const getCurrentText = (frame: number, conversation: ConversationSegment[]): string => {
  const segment = conversation.find(
    seg => frame >= seg.start && frame < seg.end
  );
  return segment ? segment.text : '';
};

export const getCameraShot = (frame: number, cameraSequence: CameraSequenceItem[]): string => {
  const currentSequence = cameraSequence.find(
    seq => frame >= seq.start && frame < seq.end
  );
  return currentSequence ? currentSequence.shotName : 'wide';
};

// Generate timestamp for filename
export const generateTimestamp = (): string => {
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
};