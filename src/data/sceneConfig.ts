import { Speaker } from '../components/characters/CharacterAnimations';
import { CharacterAudioConfig } from '../types/audio';
import { EnvironmentType } from '../components/environment/EnvironmentFactory';

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

export type CharacterGender = 'male' | 'female';

export interface CharacterStyle {
  name: string;
  gender: CharacterGender;
  primaryColor: string; // Hex color for shirt
  secondaryColor: string; // Hex color for pants
  hairColor: string;
  skinTone: string;
  audioConfig?: CharacterAudioConfig; // Voice configuration for this character
}

export interface SceneConfig {
  environment?: EnvironmentType; // Environment setting
  cameraSequence: CameraSequenceItem[];
  conversation: ConversationSegment[];
  backgroundAudio?: string;
  ambientSounds?: string[];
  characters?: {
    character1: CharacterStyle;
    character2: CharacterStyle;
  };
  audioSettings?: {
    generateVoiceover?: boolean; // Whether to generate TTS for dialogues
    model?: 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts'; // TTS model to use
    globalSpeed?: number; // Global speed modifier for all voices
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
      gender: 'male',
      primaryColor: '#2563eb', // Blue shirt
      secondaryColor: '#1e3a8a', // Dark blue pants
      hairColor: '#8b4513', // Brown hair
      skinTone: '#deb887', // Light skin tone
      audioConfig: {
        voice: 'onyx',
        voiceInstructions: 'Thoughtful and philosophical, speaking with measured cadence and occasional pauses for emphasis. Slightly older male voice with wisdom and contemplation.',
        speed: 0.95
      }
    },
    character2: {
      name: 'Maya',
      gender: 'female',
      primaryColor: '#dc2626', // Red shirt
      secondaryColor: '#991b1b', // Dark red pants
      hairColor: '#2d1b69', // Dark purple hair
      skinTone: '#cd853f', // Slightly darker skin tone
      audioConfig: {
        voice: 'nova',
        voiceInstructions: 'Curious and insightful, with warmth and wonder in the voice. Speaks with natural enthusiasm about deep topics, occasionally speeding up when excited about an idea.',
        speed: 1.0
      }
    }
  },
  audioSettings: {
    generateVoiceover: true,
    model: 'gpt-4o-mini-tts',
    globalSpeed: 1.0
  }
};

// Simple conversation with mixed gender pair
export const simpleConversationConfig: SceneConfig = {
  cameraSequence: [
    { shotName: 'wide', start: 0, end: 150 },
    { shotName: 'character1Focus', start: 150, end: 300 },
    { shotName: 'character2Focus', start: 300, end: 450 },
    { shotName: 'overShoulder1', start: 450, end: 600 },
    { shotName: 'overShoulder2', start: 600, end: 750 },
    { shotName: 'sideProfile', start: 750, end: 900 }
  ],
  conversation: [
    { start: 0, end: 150, speaker: Speaker.CHARACTER_1, text: 'It\'s such a beautiful day for a walk, Sarah!' },
    { start: 150, end: 300, speaker: Speaker.CHARACTER_2, text: 'I know, right? The weather is perfect.' },
    { start: 300, end: 450, speaker: Speaker.CHARACTER_1, text: 'I love how the sunlight filters through the trees.' },
    { start: 450, end: 600, speaker: Speaker.CHARACTER_2, text: 'It reminds me of our hikes back in college.' },
    { start: 600, end: 750, speaker: Speaker.CHARACTER_1, text: 'Those were good times. We should do this more often.' },
    { start: 750, end: 900, speaker: Speaker.CHARACTER_2, text: 'Definitely! Maybe we can make it a weekly thing.' }
  ],
  characters: {
    character1: {
      name: 'Tom',
      gender: 'male',
      primaryColor: '#059669', // Green shirt
      secondaryColor: '#064e3b', // Dark green pants
      hairColor: '#1f2937', // Dark hair
      skinTone: '#fdbcb4', // Light skin tone
      audioConfig: {
        voice: 'alloy',
        voiceInstructions: 'Friendly and casual, with a warm conversational tone. Young adult male voice with natural enthusiasm and genuine emotion.',
        speed: 1.0
      }
    },
    character2: {
      name: 'Sarah',
      gender: 'female',
      primaryColor: '#7c3aed', // Purple shirt
      secondaryColor: '#4c1d95', // Dark purple pants
      hairColor: '#fbbf24', // Blonde hair
      skinTone: '#e0ac69', // Medium skin tone
      audioConfig: {
        voice: 'shimmer',
        voiceInstructions: 'Warm and nostalgic, with a gentle and reminiscent quality. Soft female voice that brightens when recalling happy memories.',
        speed: 1.0
      }
    }
  },
  audioSettings: {
    generateVoiceover: true,
    model: 'gpt-4o-mini-tts',
    globalSpeed: 1.0
  }
};

// Container philosophy conversation
export const containerConversationConfig: SceneConfig = {
  cameraSequence: [
    { shotName: 'environment', start: 0, end: 150 },
    { shotName: 'wide', start: 150, end: 300 },
    { shotName: 'character1Focus', start: 300, end: 450 },
    { shotName: 'character2Focus', start: 450, end: 600 },
    { shotName: 'closeUp', start: 600, end: 750 },
    { shotName: 'sideProfile', start: 750, end: 900 },
    { shotName: 'overShoulder2', start: 900, end: 1050 },
    { shotName: 'overShoulder1', start: 1050, end: 1200 },
    { shotName: 'tracking', start: 1200, end: 1350 },
    { shotName: 'highAngle', start: 1350, end: 1500 },
    { shotName: 'lowAngle', start: 1500, end: 1650 },
    { shotName: 'frontView', start: 1650, end: 1800 },
    { shotName: 'closeUp', start: 1800, end: 1950 },
    { shotName: 'wide', start: 1950, end: 2100 }
  ],
  conversation: [
    { start: 0, end: 150, speaker: Speaker.NONE, text: '' },
    { start: 150, end: 300, speaker: Speaker.CHARACTER_1, text: 'Have you ever noticed, Sophia, how almost everything in our world is a container?' },
    { start: 300, end: 450, speaker: Speaker.CHARACTER_2, text: 'What do you mean? Like boxes and jars?' },
    { start: 450, end: 600, speaker: Speaker.CHARACTER_1, text: 'Yes, but it goes so much deeper. Our bodies are containers for our consciousness. Our homes contain our lives.' },
    { start: 600, end: 750, speaker: Speaker.CHARACTER_2, text: 'Oh... I see. Even this forest path is a container - it holds our journey, our footsteps.' },
    { start: 750, end: 900, speaker: Speaker.CHARACTER_1, text: 'Exactly! And think about it - words are containers for meaning, songs contain emotions, memories contain experiences.' },
    { start: 900, end: 1050, speaker: Speaker.CHARACTER_2, text: 'That\'s fascinating! Even time itself is like a container, holding moments that flow through it.' },
    { start: 1050, end: 1200, speaker: Speaker.CHARACTER_1, text: 'And what about relationships? They\'re containers for love, trust, shared experiences between people.' },
    { start: 1200, end: 1350, speaker: Speaker.CHARACTER_2, text: 'This is making me see everything differently. The sky contains the clouds, the ocean contains life...' },
    { start: 1350, end: 1500, speaker: Speaker.CHARACTER_1, text: 'Even abstract things - a university contains knowledge, a tradition contains culture, a story contains wisdom.' },
    { start: 1500, end: 1650, speaker: Speaker.CHARACTER_2, text: 'It\'s like the entire universe is just nested containers within containers, each holding something precious.' },
    { start: 1650, end: 1800, speaker: Speaker.CHARACTER_1, text: 'And perhaps the most profound container of all is the present moment - it holds everything that truly exists.' },
    { start: 1800, end: 1950, speaker: Speaker.CHARACTER_2, text: 'That\'s beautiful, Marcus. We\'re walking through containers, talking about containers, being containers ourselves.' },
    { start: 1950, end: 2100, speaker: Speaker.BOTH, text: 'Everything contains something...' }
  ],
  characters: {
    character1: {
      name: 'Marcus',
      gender: 'male',
      primaryColor: '#4a5568', // Gray shirt - philosophical
      secondaryColor: '#2d3748', // Dark gray pants
      hairColor: '#1a202c', // Very dark hair
      skinTone: '#f7fafc', // Light skin tone
      audioConfig: {
        voice: 'onyx',
        voiceInstructions: 'Deep, contemplative voice with a sense of wonder. Speaks slowly and thoughtfully, with pauses between profound observations. Slightly mystical quality, as if seeing hidden truths in everyday things.',
        speed: 0.9
      }
    },
    character2: {
      name: 'Sophia',
      gender: 'female',
      primaryColor: '#805ad5', // Purple shirt - wisdom
      secondaryColor: '#553c9a', // Dark purple pants
      hairColor: '#744210', // Auburn hair
      skinTone: '#fed7aa', // Warm skin tone
      audioConfig: {
        voice: 'nova',
        voiceInstructions: 'Intelligent and curious, with growing excitement as she discovers new perspectives. Voice brightens with each realization, speaking with clarity and wonder. Natural pauses as she processes these philosophical insights.',
        speed: 0.95
      }
    }
  },
  audioSettings: {
    generateVoiceover: true,
    model: 'gpt-4o-mini-tts',
    globalSpeed: 1.0
  }
};

// Default configuration - can be overridden via props
export const defaultSceneConfig: SceneConfig = deepConversationConfig;