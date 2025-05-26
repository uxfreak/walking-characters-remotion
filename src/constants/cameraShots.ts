import * as THREE from 'three';

export interface CameraShot {
  name: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
  duration?: number; // Duration in frames
}

export const CameraShots: { [key: string]: CameraShot } = {
  // Wide establishing shot
  wide: {
    name: 'Wide Shot',
    position: new THREE.Vector3(-3, 4, 8),
    target: new THREE.Vector3(0, 2, 0),
    fov: 60
  },
  
  // Close-up on both characters
  closeUp: {
    name: 'Close Up',
    position: new THREE.Vector3(0, 2.5, 3),
    target: new THREE.Vector3(0, 2.2, 0),
    fov: 50
  },
  
  // Over shoulder shot - Character 1's perspective
  overShoulder1: {
    name: 'Over Shoulder 1',
    position: new THREE.Vector3(-1.5, 2.8, 1),
    target: new THREE.Vector3(0.8, 2.2, -1),
    fov: 55
  },
  
  // Over shoulder shot - Character 2's perspective
  overShoulder2: {
    name: 'Over Shoulder 2',
    position: new THREE.Vector3(1.5, 2.8, 1),
    target: new THREE.Vector3(-0.8, 2.2, -1),
    fov: 55
  },
  
  // Side profile shot
  sideProfile: {
    name: 'Side Profile',
    position: new THREE.Vector3(4, 2.5, 0),
    target: new THREE.Vector3(0, 2, 0),
    fov: 50
  },
  
  // Low angle dramatic shot
  lowAngle: {
    name: 'Low Angle',
    position: new THREE.Vector3(0, 0.5, 4),
    target: new THREE.Vector3(0, 2.5, 0),
    fov: 65
  },
  
  // High angle looking down
  highAngle: {
    name: 'High Angle',
    position: new THREE.Vector3(0, 8, 5),
    target: new THREE.Vector3(0, 1, 0),
    fov: 55
  },
  
  // Walking alongside shot
  walkingAlongside: {
    name: 'Walking Alongside',
    position: new THREE.Vector3(-3, 2, 0),
    target: new THREE.Vector3(0, 2, 0),
    fov: 50
  },
  
  // Front view - characters walking toward camera
  frontView: {
    name: 'Front View',
    position: new THREE.Vector3(0, 2.5, -5),
    target: new THREE.Vector3(0, 2, 0),
    fov: 55
  },
  
  // Dynamic tracking shot
  tracking: {
    name: 'Tracking Shot',
    position: new THREE.Vector3(-2, 3, 4),
    target: new THREE.Vector3(0, 2, -1),
    fov: 58
  },
  
  // Focus on Character 1
  character1Focus: {
    name: 'Character 1 Focus',
    position: new THREE.Vector3(-2, 2.5, 2),
    target: new THREE.Vector3(-0.8, 2.2, 0),
    fov: 45
  },
  
  // Focus on Character 2
  character2Focus: {
    name: 'Character 2 Focus',
    position: new THREE.Vector3(2, 2.5, 2),
    target: new THREE.Vector3(0.8, 2.2, 0),
    fov: 45
  },
  
  // Environment shot showing the jungle
  environment: {
    name: 'Environment Shot',
    position: new THREE.Vector3(-5, 6, 10),
    target: new THREE.Vector3(0, 3, -5),
    fov: 70
  },
  
  // Dutch angle for dramatic effect
  dutchAngle: {
    name: 'Dutch Angle',
    position: new THREE.Vector3(-2, 3, 5),
    target: new THREE.Vector3(0, 2, 0),
    fov: 55
  }
};

// Helper function to interpolate between shots
export const interpolateShots = (
  shot1: CameraShot,
  shot2: CameraShot,
  progress: number // 0 to 1
): { position: THREE.Vector3; target: THREE.Vector3; fov: number } => {
  const position = new THREE.Vector3().lerpVectors(shot1.position, shot2.position, progress);
  const target = new THREE.Vector3().lerpVectors(shot1.target, shot2.target, progress);
  const fov = (shot1.fov || 60) + ((shot2.fov || 60) - (shot1.fov || 60)) * progress;
  
  return { position, target, fov };
};

// Predefined shot sequences for different moods
export const ShotSequences = {
  conversation: [
    { shot: 'wide', duration: 90 },
    { shot: 'closeUp', duration: 60 },
    { shot: 'overShoulder1', duration: 90 },
    { shot: 'overShoulder2', duration: 90 },
    { shot: 'sideProfile', duration: 60 },
    { shot: 'closeUp', duration: 90 }
  ],
  
  dramatic: [
    { shot: 'lowAngle', duration: 60 },
    { shot: 'dutchAngle', duration: 90 },
    { shot: 'highAngle', duration: 60 },
    { shot: 'tracking', duration: 120 }
  ],
  
  exploration: [
    { shot: 'environment', duration: 120 },
    { shot: 'wide', duration: 90 },
    { shot: 'walkingAlongside', duration: 90 },
    { shot: 'frontView', duration: 60 }
  ]
};

// Get camera shot for a specific frame based on a sequence
export const getShotFromSequence = (
  sequence: Array<{ shot: string; duration: number }>,
  frame: number
): CameraShot => {
  let accumulatedFrames = 0;
  
  for (const item of sequence) {
    if (frame < accumulatedFrames + item.duration) {
      return CameraShots[item.shot];
    }
    accumulatedFrames += item.duration;
  }
  
  // Return last shot if frame exceeds sequence
  return CameraShots[sequence[sequence.length - 1].shot];
};