import React from 'react';
import { Composition } from 'remotion';
import WalkingCharactersScene, { WalkingCharactersSceneProps } from '../WalkingCharactersScene';
import { Speaker } from '../components/characters/CharacterAnimations';

// Example of speaker timeline for a conversation
const getSpeakerAtFrame = (frame: number): Speaker => {
  // Example conversation timeline (30 fps)
  // 0-90 frames (0-3 seconds): Character 1 speaking
  // 90-180 frames (3-6 seconds): Character 2 speaking
  // 180-240 frames (6-8 seconds): Both speaking (excited conversation)
  // 240-300 frames (8-10 seconds): Character 1 speaking
  // 300-360 frames (10-12 seconds): Character 2 speaking
  // 360+ frames: No one speaking (just walking)
  
  if (frame < 90) return Speaker.CHARACTER_1;
  else if (frame < 180) return Speaker.CHARACTER_2;
  else if (frame < 240) return Speaker.BOTH;
  else if (frame < 300) return Speaker.CHARACTER_1;
  else if (frame < 360) return Speaker.CHARACTER_2;
  else return Speaker.NONE;
};

// Remotion composition wrapper
export const WalkingCharactersComposition: React.FC<WalkingCharactersSceneProps> = ({ 
  frame = 0,
  fps = 30 
}) => {
  const currentSpeaker = getSpeakerAtFrame(frame);
  
  return (
    <WalkingCharactersScene 
      frame={frame}
      fps={fps}
      currentSpeaker={currentSpeaker}
    />
  );
};

// Example Remotion config
export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="WalkingCharacters"
        component={WalkingCharactersComposition}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          frame: 0,
          fps: 30
        }}
      />
    </>
  );
};

// Example of programmatic speaker control
export const createSpeakerTimeline = (dialogue: Array<{
  speaker: Speaker;
  startTime: number;
  duration: number;
}>, fps: number = 30) => {
  return (frame: number): Speaker => {
    const currentTime = frame / fps;
    
    for (const segment of dialogue) {
      const endTime = segment.startTime + segment.duration;
      if (currentTime >= segment.startTime && currentTime < endTime) {
        return segment.speaker;
      }
    }
    
    return Speaker.NONE;
  };
};

// Example usage with dialogue timeline
const dialogueTimeline = [
  { speaker: Speaker.CHARACTER_1, startTime: 0, duration: 3 },
  { speaker: Speaker.CHARACTER_2, startTime: 3, duration: 3 },
  { speaker: Speaker.BOTH, startTime: 6, duration: 2 },
  { speaker: Speaker.CHARACTER_1, startTime: 8, duration: 2 },
  { speaker: Speaker.CHARACTER_2, startTime: 10, duration: 2 },
];

export const getSpeakerFromDialogue = createSpeakerTimeline(dialogueTimeline);

// Advanced example with audio synchronization
export interface AudioSyncData {
  frame: number;
  amplitude: number;
  speaker: Speaker;
}

export const WalkingCharactersWithAudioSync: React.FC<{
  frame: number;
  audioData?: AudioSyncData[];
}> = ({ frame, audioData }) => {
  // Find current speaker from audio data
  const currentSpeaker = audioData
    ? audioData.find(data => data.frame === frame)?.speaker || Speaker.NONE
    : getSpeakerAtFrame(frame);
  
  return (
    <WalkingCharactersScene 
      frame={frame}
      fps={30}
      currentSpeaker={currentSpeaker}
    />
  );
};