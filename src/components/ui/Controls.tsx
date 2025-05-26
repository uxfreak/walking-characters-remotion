import React from 'react';

export interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  title?: string;
  subtitle?: string;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  title = '🌴 Two friends exploring deep jungle paths',
  subtitle = 'Drag to orbit • Scroll to zoom'
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '10px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <button
        onClick={onPlayPause}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#2E4057',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#3E5067';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2E4057';
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '14px' }}>
        {title}
      </div>
      
      <div style={{ marginTop: '5px', fontSize: '12px', color: '#ccc' }}>
        {subtitle}
      </div>
    </div>
  );
};