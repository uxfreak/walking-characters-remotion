import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import WalkingCharactersScene from '../WalkingCharactersScene';
import { Speaker } from '../components/characters/CharacterAnimations';
import { CameraShots, interpolateShots } from '../constants/cameraShots';

// Define camera cuts with smooth transitions
const cameraSequence = [
  { shotName: 'environment', start: 0, end: 60 },          // Establishing shot
  { shotName: 'wide', start: 60, end: 150 },              // Wide shot for first dialogue
  { shotName: 'character1Focus', start: 150, end: 240 },  // Focus on speaker 1
  { shotName: 'character2Focus', start: 240, end: 330 },  // Focus on speaker 2
  { shotName: 'closeUp', start: 330, end: 420 },          // Both characters for excitement
  { shotName: 'sideProfile', start: 420, end: 480 },      // Side view
  { shotName: 'overShoulder1', start: 480, end: 540 },    // Over shoulder
  { shotName: 'overShoulder2', start: 540, end: 600 },    // Other shoulder
  { shotName: 'tracking', start: 600, end: 690 },         // Dynamic tracking
  { shotName: 'lowAngle', start: 690, end: 750 },         // Dramatic low angle
  { shotName: 'highAngle', start: 750, end: 810 },        // Looking down
  { shotName: 'frontView', start: 810, end: 870 },        // Characters approaching
  { shotName: 'wide', start: 870, end: 900 },             // Final wide shot
];

// Conversation with matched timing
const conversation = [
  { start: 0, end: 90, speaker: Speaker.NONE },
  { start: 90, end: 180, speaker: Speaker.CHARACTER_1, text: "This jungle path is incredible!" },
  { start: 180, end: 270, speaker: Speaker.CHARACTER_2, text: "I've never seen trees this tall before." },
  { start: 270, end: 360, speaker: Speaker.CHARACTER_1, text: "Look at all the wildlife around us!" },
  { start: 360, end: 450, speaker: Speaker.BOTH, text: "Did you see that?!" },
  { start: 450, end: 540, speaker: Speaker.CHARACTER_2, text: "It's so peaceful here." },
  { start: 540, end: 630, speaker: Speaker.CHARACTER_1, text: "We should explore more often." },
  { start: 630, end: 720, speaker: Speaker.CHARACTER_2, text: "Absolutely! This is amazing." },
  { start: 720, end: 810, speaker: Speaker.BOTH, text: "Adventure awaits!" },
  { start: 810, end: 900, speaker: Speaker.NONE },
];

const getCurrentShot = (frame: number) => {
  const current = cameraSequence.find(seq => frame >= seq.start && frame < seq.end);
  if (!current) return CameraShots.wide;
  
  const shot = CameraShots[current.shotName];
  const progress = (frame - current.start) / (current.end - current.start);
  
  // Add smooth transitions between shots
  if (progress < 0.1) {
    // Transition in - find previous shot
    const prevIndex = cameraSequence.findIndex(s => s === current) - 1;
    if (prevIndex >= 0) {
      const prevShot = CameraShots[cameraSequence[prevIndex].shotName];
      const transitionProgress = progress / 0.1;
      return interpolateShots(prevShot, shot, spring({
        frame: frame - current.start,
        fps: 30,
        config: {
          damping: 200,
          stiffness: 100,
          mass: 0.5
        }
      }));
    }
  }
  
  return shot;
};

const getConversation = (frame: number) => {
  const segment = conversation.find(c => frame >= c.start && frame < c.end);
  return segment || { speaker: Speaker.NONE, text: '' };
};

export const CinematicJungleWalk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const currentShot = getCurrentShot(frame);
  const { speaker, text } = getConversation(frame);
  
  // Subtitle animation
  const subtitleSegment = conversation.find(c => frame >= c.start && frame < c.end && c.text);
  let subtitleOpacity = 0;
  let subtitleY = 100;
  
  if (subtitleSegment && text) {
    const segmentProgress = (frame - subtitleSegment.start) / (subtitleSegment.end - subtitleSegment.start);
    
    if (segmentProgress < 0.1) {
      subtitleOpacity = interpolate(segmentProgress, [0, 0.1], [0, 1]);
      subtitleY = interpolate(segmentProgress, [0, 0.1], [100, 80]);
    } else if (segmentProgress < 0.9) {
      subtitleOpacity = 1;
      subtitleY = 80;
    } else {
      subtitleOpacity = interpolate(segmentProgress, [0.9, 1], [1, 0]);
      subtitleY = interpolate(segmentProgress, [0.9, 1], [80, 60]);
    }
  }
  
  // Cinematic letterbox effect for certain shots
  const isCloseShot = ['closeUp', 'character1Focus', 'character2Focus', 'overShoulder1', 'overShoulder2'].includes(
    cameraSequence.find(s => frame >= s.start && frame < s.end)?.shotName || ''
  );
  const letterboxOpacity = isCloseShot ? 0.8 : 0;
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
      <WalkingCharactersScene 
        frame={frame}
        fps={fps}
        currentSpeaker={speaker}
        cameraShot={currentShot}
        enableControls={false}
      />
      
      {/* Cinematic letterbox */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '10%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))',
        opacity: letterboxOpacity,
        transition: 'opacity 0.5s ease'
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '10%',
        background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))',
        opacity: letterboxOpacity,
        transition: 'opacity 0.5s ease'
      }} />
      
      {/* Subtitles with better styling */}
      {text && (
        <div style={{
          position: 'absolute',
          bottom: `${subtitleY}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 500,
          maxWidth: '70%',
          textAlign: 'center',
          opacity: subtitleOpacity,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {text}
        </div>
      )}
    </div>
  );
};