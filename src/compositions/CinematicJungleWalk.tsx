import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Sequence } from 'remotion';
import WalkingCharactersScene from '../WalkingCharactersScene';
import { CameraShots, interpolateShots } from '../constants/cameraShots';
import { JungleWalkProps, getSpeakerAtFrame, getCurrentText, getCameraShot } from '../utils/metadataCalculator';
import { defaultSceneConfig } from '../data/sceneConfig';

export const CinematicJungleWalk: React.FC<JungleWalkProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Use processed scene config from calculateMetadata or fallback to default
  const sceneConfig = props.sceneConfig || defaultSceneConfig;
  
  const currentSpeaker = getSpeakerAtFrame(frame, sceneConfig.conversation);
  const currentText = getCurrentText(frame, sceneConfig.conversation);
  const shotName = getCameraShot(frame, sceneConfig.cameraSequence);
  
  // Get camera shot with smooth transitions
  const getCurrentShot = () => {
    const current = sceneConfig.cameraSequence.find(seq => frame >= seq.start && frame < seq.end);
    if (!current) return CameraShots.wide;
    
    const shot = CameraShots[current.shotName] || CameraShots.wide;
    const progress = (frame - current.start) / (current.end - current.start);
    
    // Add smooth transitions between shots
    if (progress < 0.1) {
      // Transition in - find previous shot
      const currentIndex = sceneConfig.cameraSequence.findIndex(s => s === current);
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const prevShot = CameraShots[sceneConfig.cameraSequence[prevIndex].shotName] || CameraShots.wide;
        const transitionProgress = spring({
          frame: frame - current.start,
          fps: fps,
          config: {
            damping: 200,
            stiffness: 100,
            mass: 0.5
          }
        });
        return interpolateShots(prevShot, shot, transitionProgress);
      }
    }
    
    return shot;
  };
  
  const currentShot = getCurrentShot();
  
  // Find current conversation segment for subtitle timing
  const textSegment = sceneConfig.conversation.find(
    seg => frame >= seg.start && frame < seg.end
  );
  
  // Subtitle animation with vertical movement
  let subtitleOpacity = 0;
  let subtitleY = 100;
  
  if (textSegment && currentText) {
    const segmentProgress = (frame - textSegment.start) / (textSegment.end - textSegment.start);
    
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
  const isCloseShot = ['closeUp', 'character1Focus', 'character2Focus', 'overShoulder1', 'overShoulder2'].includes(shotName);
  const letterboxOpacity = isCloseShot ? 0.8 : 0;
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
      <WalkingCharactersScene 
        frame={frame}
        fps={fps}
        currentSpeaker={currentSpeaker}
        cameraShot={currentShot}
        enableControls={false}
        character1Style={sceneConfig.characters?.character1}
        character2Style={sceneConfig.characters?.character2}
        environment={sceneConfig.environment || 'jungle'}
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
        transition: 'opacity 0.5s ease',
        zIndex: 500
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '10%',
        background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))',
        opacity: letterboxOpacity,
        transition: 'opacity 0.5s ease',
        zIndex: 500
      }} />
      
      {/* Subtitles with cinematic styling */}
      {currentText && (
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
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1000
        }}>
          {currentText}
        </div>
      )}
      
      {/* Background Audio */}
      {props.backgroundAudio && (
        <Audio 
          src={staticFile(props.backgroundAudio)}
          volume={0.3}
          loop
        />
      )}
      
      {/* Dialogue Audio - Use Sequence for proper timing */}
      {sceneConfig.conversation.map((segment, index) => {
        if (segment.audioSrc) {
          return (
            <Sequence
              key={`audio-seq-${index}`}
              from={segment.start}
              durationInFrames={segment.end - segment.start}
              layout="none"
            >
              <Audio
                src={staticFile(segment.audioSrc)}
                volume={1}
              />
            </Sequence>
          );
        }
        return null;
      })}
    </div>
  );
};