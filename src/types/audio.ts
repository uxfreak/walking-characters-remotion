// Available voices for OpenAI TTS
export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

// Voice characteristics for reference
export const VoiceCharacteristics = {
  onyx: 'Deep, authoritative (older male)',
  alloy: 'Natural, smooth (young male/neutral)',
  echo: 'Articulate, precise (young male)',
  fable: 'Warm, engaging (young male)',
  nova: 'Bright, energetic (young female)',
  shimmer: 'Soft, gentle (young female)'
} as const;

// Audio generation configuration
export interface AudioConfig {
  voice: OpenAIVoice;
  speed?: number; // 0.25 to 4.0, default 1.0
  instructions?: string; // Voice personality/emotion instructions for gpt-4o-mini-tts
  model?: 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts'; // Default to gpt-4o-mini-tts for better expressiveness
}

// Character-specific audio configuration
export interface CharacterAudioConfig {
  voice: OpenAIVoice;
  voiceInstructions?: string; // e.g., "Philosophical, thoughtful, with slight British accent"
  speed?: number;
}

// Example voice instructions for different personalities
export const VoiceInstructionExamples = {
  philosophical: "Thoughtful and contemplative, speaking with measured cadence and occasional pauses for emphasis",
  enthusiastic: "High-energy and excited, with animated delivery and upward inflections",
  calm: "Zen-like calmness, soft and soothing tone with slow, deliberate pacing",
  comedic: "Playful and humorous, with varied pitch and timing for comedic effect",
  professional: "Clear and authoritative, with crisp pronunciation and confident delivery",
  friendly: "Warm and welcoming, conversational tone with natural rhythm",
  mysterious: "Low and enigmatic, with dramatic pauses and subtle intensity",
  childlike: "Innocent and curious, with higher pitch and wonder in the voice"
} as const;

// Audio file metadata
export interface AudioMetadata {
  filepath: string;
  duration: number; // in seconds
  text: string;
  speaker: string;
  voice: OpenAIVoice;
}