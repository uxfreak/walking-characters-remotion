import { CalculateMetadataFunction } from 'remotion';
import { parseMedia } from '@remotion/media-parser';
import { SceneConfig, ConversationSegment, CameraSequenceItem, defaultSceneConfig, deepConversationConfig } from '../data/sceneConfig';
import { Speaker } from '../components/characters/CharacterAnimations';

export interface JungleWalkProps {
  sceneConfig?: SceneConfig;
  fps?: number;
  width?: number;
  height?: number;
  backgroundAudio?: string;
  configType?: 'default' | 'deep';
}

// Calculate dynamic duration based on audio files or conversation timing
export const calculateJungleWalkMetadata: CalculateMetadataFunction<JungleWalkProps> = async ({
  props,
  abortSignal,
}) => {
  const fps = props.fps || 30;
  let totalDurationInFrames = 900; // Default 30 seconds
  
  // Select the appropriate config based on configType
  const baseConfig = props.configType === 'deep' ? deepConversationConfig : defaultSceneConfig;
  const sceneConfig = props.sceneConfig || baseConfig;
  
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
    
    for (const segment of sceneConfig.conversation) {
      let segmentDuration = 90; // Default 3 seconds per segment
      
      // If audio file is provided for this segment, use its duration
      if (segment.audioSrc) {
        try {
          const result = await parseMedia({
            src: segment.audioSrc,
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
      
      processedConversation.push({
        ...segment,
        start: cumulativeTime,
        end: cumulativeTime + segmentDuration,
      });
      
      cumulativeTime += segmentDuration;
    }
    
    // Update total duration based on conversation length if no background audio
    if (!props.backgroundAudio) {
      totalDurationInFrames = cumulativeTime;
    }
    
    // Adjust camera sequence to match conversation timing
    const processedCameraSequence: CameraSequenceItem[] = [];
    const segmentDuration = Math.floor(totalDurationInFrames / sceneConfig.cameraSequence.length);
    
    sceneConfig.cameraSequence.forEach((shot, index) => {
      processedCameraSequence.push({
        ...shot,
        start: index * segmentDuration,
        end: index === sceneConfig.cameraSequence.length - 1 
          ? totalDurationInFrames 
          : (index + 1) * segmentDuration,
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
  return segment ? segment.speaker : Speaker.NONE;
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