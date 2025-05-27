import { Speaker } from '../components/characters/CharacterAnimations';

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
  audioSrc?: string; // Optional audio file for this segment
}

export interface CharacterStyle {
  name: string;
  primaryColor: string; // Hex color for shirt
  secondaryColor: string; // Hex color for pants
  hairColor: string;
  skinTone: string;
}

export interface SceneConfig {
  cameraSequence: CameraSequenceItem[];
  conversation: ConversationSegment[];
  backgroundAudio?: string;
  ambientSounds?: string[];
  characters?: {
    character1: CharacterStyle;
    character2: CharacterStyle;
  };
}

// Deep conversation scene configuration
export const deepConversationConfig: SceneConfig = {
  cameraSequence: [
    { shotName: 'environment', start: 0, end: 120 },
    { shotName: 'wide', start: 120, end: 240 },
    { shotName: 'character1Focus', start: 240, end: 420 },
    { shotName: 'character2Focus', start: 420, end: 600 },
    { shotName: 'closeUp', start: 600, end: 780 },
    { shotName: 'overShoulder1', start: 780, end: 960 },
    { shotName: 'overShoulder2', start: 960, end: 1140 },
    { shotName: 'sideProfile', start: 1140, end: 1320 },
    { shotName: 'tracking', start: 1320, end: 1500 },
    { shotName: 'lowAngle', start: 1500, end: 1680 },
    { shotName: 'highAngle', start: 1680, end: 1860 },
    { shotName: 'frontView', start: 1860, end: 2040 },
    { shotName: 'wide', start: 2040, end: 2160 }
  ],
  conversation: [
    { start: 0, end: 120, speaker: Speaker.NONE, text: '' },
    { start: 120, end: 240, speaker: Speaker.CHARACTER_1, text: 'You know, Maya, walking through this ancient forest makes me think about time itself.' },
    { start: 240, end: 420, speaker: Speaker.CHARACTER_2, text: 'What do you mean, Alex? How so?' },
    { start: 420, end: 600, speaker: Speaker.CHARACTER_1, text: 'These trees have been growing for centuries. They\'ve witnessed countless stories, yet we only see this single moment.' },
    { start: 600, end: 780, speaker: Speaker.CHARACTER_2, text: 'That\'s profound. It reminds me of what my grandmother used to say about rivers...' },
    { start: 780, end: 960, speaker: Speaker.CHARACTER_1, text: 'What did she say?' },
    { start: 960, end: 1140, speaker: Speaker.CHARACTER_2, text: 'She said rivers never really change, yet the water is always different. Like our friendship - constant, but always evolving.' },
    { start: 1140, end: 1320, speaker: Speaker.CHARACTER_1, text: 'I never thought of it that way. We\'ve known each other for years, but every conversation reveals something new.' },
    { start: 1320, end: 1500, speaker: Speaker.CHARACTER_2, text: 'Exactly! Sometimes I wonder what we\'ll discover about ourselves on this journey.' },
    { start: 1500, end: 1680, speaker: Speaker.CHARACTER_1, text: 'Maybe that\'s the real adventure - not just exploring the world, but understanding who we are within it.' },
    { start: 1680, end: 1860, speaker: Speaker.CHARACTER_2, text: 'And perhaps realizing that we\'re just as interconnected as this forest ecosystem around us.' },
    { start: 1860, end: 2040, speaker: Speaker.BOTH, text: 'The journey continues...' },
    { start: 2040, end: 2160, speaker: Speaker.NONE, text: '' }
  ],
  characters: {
    character1: {
      name: 'Alex',
      primaryColor: '#2563eb', // Blue shirt
      secondaryColor: '#1e3a8a', // Dark blue pants
      hairColor: '#8b4513', // Brown hair
      skinTone: '#deb887' // Light skin tone
    },
    character2: {
      name: 'Maya',
      primaryColor: '#dc2626', // Red shirt
      secondaryColor: '#991b1b', // Dark red pants
      hairColor: '#2d1b69', // Dark purple hair
      skinTone: '#cd853f' // Slightly darker skin tone
    }
  }
};

// Default configuration - can be overridden via props
export const defaultSceneConfig: SceneConfig = deepConversationConfig;