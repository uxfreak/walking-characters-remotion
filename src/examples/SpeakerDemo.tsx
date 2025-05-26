import React, { useState, useEffect } from 'react';
import WalkingCharactersScene from '../WalkingCharactersScene';
import { Speaker } from '../components/characters/CharacterAnimations';

// Demo component showing different speaker states
export const SpeakerDemo: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>(Speaker.CHARACTER_1);
  const [useTimeline, setUseTimeline] = useState(true);
  
  const fps = 30;
  
  // Example conversation timeline
  const getTimelineSpeaker = (currentFrame: number): Speaker => {
    const second = Math.floor(currentFrame / fps);
    const cycle = second % 12;
    
    if (cycle < 3) return Speaker.CHARACTER_1;
    else if (cycle < 6) return Speaker.CHARACTER_2;
    else if (cycle < 8) return Speaker.BOTH;
    else if (cycle < 10) return Speaker.CHARACTER_1;
    else if (cycle < 11) return Speaker.CHARACTER_2;
    else return Speaker.NONE;
  };
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setFrame(prev => prev + 1);
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [isPlaying, fps]);
  
  const currentSpeaker = useTimeline ? getTimelineSpeaker(frame) : selectedSpeaker;
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <WalkingCharactersScene 
        frame={frame}
        fps={fps}
        currentSpeaker={currentSpeaker}
      />
      
      {/* Enhanced Demo Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        minWidth: '250px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Speaker Controls</h3>
        
        {/* Timeline Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useTimeline}
              onChange={(e) => setUseTimeline(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Use Conversation Timeline
          </label>
        </div>
        
        {/* Manual Speaker Selection */}
        {!useTimeline && (
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Manual Speaker:</p>
            {Object.values(Speaker).map(speaker => (
              <label 
                key={speaker}
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="speaker"
                  value={speaker}
                  checked={selectedSpeaker === speaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value as Speaker)}
                  style={{ marginRight: '8px' }}
                />
                {speaker === Speaker.CHARACTER_1 && '👤 Character 1'}
                {speaker === Speaker.CHARACTER_2 && '👥 Character 2'}
                {speaker === Speaker.BOTH && '👫 Both'}
                {speaker === Speaker.NONE && '🤐 None'}
              </label>
            ))}
          </div>
        )}
        
        {/* Timeline Display */}
        {useTimeline && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#ccc' }}>
              Conversation Timeline:
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              0-3s: Character 1<br/>
              3-6s: Character 2<br/>
              6-8s: Both (excited)<br/>
              8-10s: Character 1<br/>
              10-11s: Character 2<br/>
              11-12s: Silent walk
            </p>
          </div>
        )}
        
        {/* Frame Controls */}
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #444' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: '#2E4057',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setFrame(0)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2E4057',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
        
        {/* Current State Display */}
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#ccc',
          textAlign: 'center'
        }}>
          Frame: {frame} | Time: {(frame / fps).toFixed(1)}s
        </div>
      </div>
    </div>
  );
};

// Example of speaker patterns for different conversation types
export const ConversationPatterns = {
  // Normal conversation
  normal: (frame: number, fps: number): Speaker => {
    const second = Math.floor(frame / fps);
    return second % 4 < 2 
      ? (second % 4 === 0 ? Speaker.CHARACTER_1 : Speaker.CHARACTER_2)
      : Speaker.NONE;
  },
  
  // Excited discussion
  excited: (frame: number, fps: number): Speaker => {
    const second = Math.floor(frame / fps);
    return second % 3 === 2 ? Speaker.BOTH : 
           second % 3 === 0 ? Speaker.CHARACTER_1 : Speaker.CHARACTER_2;
  },
  
  // Monologue
  monologue: (frame: number, fps: number): Speaker => {
    const second = Math.floor(frame / fps);
    return second % 10 < 8 ? Speaker.CHARACTER_1 : Speaker.NONE;
  },
  
  // Argument
  argument: (frame: number, fps: number): Speaker => {
    const progress = frame / fps;
    return Math.sin(progress * 3) > 0 ? Speaker.CHARACTER_1 : Speaker.CHARACTER_2;
  }
};