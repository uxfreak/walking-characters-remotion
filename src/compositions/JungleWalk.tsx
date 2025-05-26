import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import WalkingCharactersScene from '../WalkingCharactersScene';
import { Speaker } from '../components/characters/CharacterAnimations';
import { CameraShots, getShotFromSequence, ShotSequences } from '../constants/cameraShots';

// Define conversation segments with timing
const conversationSegments = [
  { start: 0, end: 90, speaker: Speaker.CHARACTER_1, text: "Look at these amazing trees!" },
  { start: 90, end: 180, speaker: Speaker.CHARACTER_2, text: "The jungle is so peaceful today." },
  { start: 180, end: 270, speaker: Speaker.BOTH, text: "Did you hear that sound?!" },
  { start: 270, end: 360, speaker: Speaker.CHARACTER_1, text: "It's just the birds, don't worry." },
  { start: 360, end: 450, speaker: Speaker.CHARACTER_2, text: "This path goes on forever!" },
  { start: 450, end: 540, speaker: Speaker.CHARACTER_1, text: "That's the beauty of nature." },
  { start: 540, end: 630, speaker: Speaker.BOTH, text: "Let's explore more!" },
  { start: 630, end: 720, speaker: Speaker.CHARACTER_2, text: "I love these adventures with you." },
  { start: 720, end: 810, speaker: Speaker.CHARACTER_1, text: "Me too, my friend." },
  { start: 810, end: 900, speaker: Speaker.NONE, text: "" } // Silent walking
];

const getSpeakerAtFrame = (frame: number): Speaker => {
  const segment = conversationSegments.find(
    seg => frame >= seg.start && frame < seg.end
  );
  return segment ? segment.speaker : Speaker.NONE;
};

const getCurrentText = (frame: number): string => {
  const segment = conversationSegments.find(
    seg => frame >= seg.start && frame < seg.end
  );
  return segment ? segment.text : "";
};

export const JungleWalk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const currentSpeaker = getSpeakerAtFrame(frame);
  const currentText = getCurrentText(frame);
  
  // Get camera shot based on frame
  const currentShot = getShotFromSequence(ShotSequences.conversation, frame);
  
  // Fade in/out for subtitles
  const textSegment = conversationSegments.find(
    seg => frame >= seg.start && frame < seg.end
  );
  
  let subtitleOpacity = 0;
  if (textSegment && currentText) {
    const segmentProgress = (frame - textSegment.start) / (textSegment.end - textSegment.start);
    
    // Fade in during first 10% of segment
    if (segmentProgress < 0.1) {
      subtitleOpacity = interpolate(segmentProgress, [0, 0.1], [0, 1]);
    }
    // Full opacity during middle
    else if (segmentProgress < 0.9) {
      subtitleOpacity = 1;
    }
    // Fade out during last 10%
    else {
      subtitleOpacity = interpolate(segmentProgress, [0.9, 1], [1, 0]);
    }
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <WalkingCharactersScene 
        frame={frame}
        fps={fps}
        currentSpeaker={currentSpeaker}
        cameraShot={currentShot}
        enableControls={false}
      />
      
      {/* Subtitles */}
      {currentText && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '10px',
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '80%',
          textAlign: 'center',
          opacity: subtitleOpacity,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}>
          {currentText}
        </div>
      )}
      
    </div>
  );
};