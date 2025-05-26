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

export interface SceneConfig {
  cameraSequence: CameraSequenceItem[];
  conversation: ConversationSegment[];
  backgroundAudio?: string;
  ambientSounds?: string[];
}

// Default configuration - can be overridden via props
export const defaultSceneConfig: SceneConfig = {
  cameraSequence: [
    { shotName: 'environment', start: 0, end: 60 },
    { shotName: 'wide', start: 60, end: 150 },
    { shotName: 'character1Focus', start: 150, end: 240 },
    { shotName: 'character2Focus', start: 240, end: 330 },
    { shotName: 'closeUp', start: 330, end: 420 },
    { shotName: 'sideProfile', start: 420, end: 480 },
    { shotName: 'overShoulder1', start: 480, end: 540 },
    { shotName: 'overShoulder2', start: 540, end: 600 },
    { shotName: 'tracking', start: 600, end: 690 },
    { shotName: 'lowAngle', start: 690, end: 750 },
    { shotName: 'highAngle', start: 750, end: 810 },
    { shotName: 'frontView', start: 810, end: 870 },
    { shotName: 'wide', start: 870, end: 900 }
  ],
  conversation: [
    { start: 0, end: 90, speaker: Speaker.NONE, text: '' },
    { start: 90, end: 180, speaker: Speaker.CHARACTER_1, text: 'This jungle path is incredible!' },
    { start: 180, end: 270, speaker: Speaker.CHARACTER_2, text: "I've never seen trees this tall before." },
    { start: 270, end: 360, speaker: Speaker.CHARACTER_1, text: 'Look at all the wildlife around us!' },
    { start: 360, end: 450, speaker: Speaker.BOTH, text: 'Did you see that?!' },
    { start: 450, end: 540, speaker: Speaker.CHARACTER_2, text: "It's so peaceful here." },
    { start: 540, end: 630, speaker: Speaker.CHARACTER_1, text: 'We should explore more often.' },
    { start: 630, end: 720, speaker: Speaker.CHARACTER_2, text: 'Absolutely! This is amazing.' },
    { start: 720, end: 810, speaker: Speaker.BOTH, text: 'Adventure awaits!' },
    { start: 810, end: 900, speaker: Speaker.NONE, text: '' }
  ]
};