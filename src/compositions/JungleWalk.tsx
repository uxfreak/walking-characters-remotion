import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import WalkingCharactersScene from '../WalkingCharactersScene';
import { CameraShots } from '../constants/cameraShots';
import { JungleWalkProps, getSpeakerAtFrame, getCurrentText, getCameraShot } from '../utils/metadataCalculator';
import { defaultSceneConfig } from '../data/sceneConfig';

export const JungleWalk: React.FC<JungleWalkProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Use processed scene config from calculateMetadata or fallback to default
  const sceneConfig = props.sceneConfig || defaultSceneConfig;
  
  const currentSpeaker = getSpeakerAtFrame(frame, sceneConfig.conversation);
  const currentText = getCurrentText(frame, sceneConfig.conversation);
  const shotName = getCameraShot(frame, sceneConfig.cameraSequence);
  
  // Get camera shot from shots configuration
  const currentShot = CameraShots[shotName] || CameraShots.wide;
  
  // Find current conversation segment for subtitle timing
  const textSegment = sceneConfig.conversation.find(
    seg => frame >= seg.start && frame < seg.end
  );
  
  // Calculate subtitle opacity with fade in/out
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
        character1Style={sceneConfig.characters?.character1}
        character2Style={sceneConfig.characters?.character2}
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          {currentText}
        </div>
      )}
      
      {/* Background Audio */}
      {props.backgroundAudio && (
        <audio 
          src={props.backgroundAudio}
          style={{ display: 'none' }}
          autoPlay
          loop
        />
      )}
    </div>
  );
};