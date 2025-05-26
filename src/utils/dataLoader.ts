import { Speaker } from '../components/characters/CharacterAnimations';
import { CameraShots } from '../constants/cameraShots';

// Load JSON data dynamically
import cameraSequenceData from '../data/cameraSequence.json';
import conversationData from '../data/conversation.json';
import renderConfigData from '../data/renderConfig.json';

export interface CameraSequenceItem {
  shotName: string;
  start: number;
  end: number;
}

export interface ConversationSegment {
  start: number;
  end: number;
  speaker: Speaker;
  text: string;
}

export interface RenderConfig {
  render: {
    outputDirectory: string;
    videoFormat: string;
    qualityPreset: string;
    filenameTemplate: string;
    cinematicFilenameTemplate: string;
    timezone: string;
    timestampFormat: string;
  };
  video: {
    duration: number;
    fps: number;
    totalFrames: number;
    resolution: {
      width: number;
      height: number;
    };
  };
}

// Convert string speaker to enum
const mapSpeaker = (speakerStr: string): Speaker => {
  switch (speakerStr) {
    case 'CHARACTER_1': return Speaker.CHARACTER_1;
    case 'CHARACTER_2': return Speaker.CHARACTER_2;
    case 'BOTH': return Speaker.BOTH;
    case 'NONE':
    default: return Speaker.NONE;
  }
};

export const getCameraSequence = (): CameraSequenceItem[] => {
  return cameraSequenceData.cameraSequence;
};

export const getConversation = (): ConversationSegment[] => {
  return conversationData.conversation.map(segment => ({
    ...segment,
    speaker: mapSpeaker(segment.speaker)
  }));
};

export const getRenderConfig = (): RenderConfig => {
  return renderConfigData as RenderConfig;
};

export const getSpeakerAtFrame = (frame: number): Speaker => {
  const conversation = getConversation();
  const segment = conversation.find(
    seg => frame >= seg.start && frame < seg.end
  );
  return segment ? segment.speaker : Speaker.NONE;
};

export const getCurrentText = (frame: number): string => {
  const conversation = getConversation();
  const segment = conversation.find(
    seg => frame >= seg.start && frame < seg.end
  );
  return segment ? segment.text : "";
};

export const getCameraShot = (frame: number) => {
  const cameraSequence = getCameraSequence();
  const currentSequence = cameraSequence.find(
    seq => frame >= seq.start && frame < seq.end
  );
  
  if (currentSequence && CameraShots[currentSequence.shotName]) {
    return CameraShots[currentSequence.shotName];
  }
  
  // Fallback to wide shot
  return CameraShots.wide;
};

export const generateTimestamp = (): string => {
  const config = getRenderConfig();
  const now = new Date();
  
  // Convert to Indian timezone
  const indianTime = new Date(now.toLocaleString("en-US", {timeZone: config.render.timezone}));
  
  // Format: YYYY-MM-DD_HH-mm-ss
  const year = indianTime.getFullYear();
  const month = String(indianTime.getMonth() + 1).padStart(2, '0');
  const day = String(indianTime.getDate()).padStart(2, '0');
  const hours = String(indianTime.getHours()).padStart(2, '0');
  const minutes = String(indianTime.getMinutes()).padStart(2, '0');
  const seconds = String(indianTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

export const generateFilename = (template: string): string => {
  const timestamp = generateTimestamp();
  return template.replace('{timestamp}', timestamp);
};