import * as THREE from 'three';

export const CharacterMaterials = {
  skin: new THREE.MeshPhongMaterial({ 
    color: 0xf4c896,
    shininess: 40
  }),
  shirt: new THREE.MeshPhongMaterial({
    color: 0x2E4057,
    shininess: 20
  }),
  pants: new THREE.MeshPhongMaterial({
    color: 0x1A1A2E,
    shininess: 15
  }),
  hair: new THREE.MeshPhongMaterial({ 
    color: 0x4A3A2A, 
    shininess: 30 
  }),
  mouth: new THREE.MeshPhongMaterial({ 
    color: 0x2A0505, 
    shininess: 10 
  }),
  nose: new THREE.MeshPhongMaterial({ 
    color: 0xf0c080, 
    shininess: 30 
  }),
  eyeWhite: new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF, 
    shininess: 50 
  }),
  pupil: new THREE.MeshPhongMaterial({ 
    color: 0x1A1A1A, 
    shininess: 80 
  }),
  eyeHighlight: new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF, 
    emissive: 0xFFFFFF, 
    emissiveIntensity: 0.3 
  }),
  eyebrow: new THREE.MeshPhongMaterial({ 
    color: 0x4A3A2A, 
    shininess: 20 
  }),
  shoe: new THREE.MeshPhongMaterial({ 
    color: 0x2A1A0A, 
    shininess: 40 
  })
};

export const EnvironmentMaterials = {
  road: new THREE.MeshPhongMaterial({ 
    color: 0x404040,
    shininess: 10
  }),
  roadLine: new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF,
    emissive: 0x222222
  }),
  sidewalk: new THREE.MeshPhongMaterial({ 
    color: 0x666666,
    shininess: 5
  }),
  grass: new THREE.MeshPhongMaterial({ 
    color: 0x4A7C59 
  }),
  ground: new THREE.MeshPhongMaterial({ 
    color: 0x2F4F2F 
  }),
  path: new THREE.MeshPhongMaterial({ 
    color: 0x8B4513,
    shininess: 5
  }),
  bush: new THREE.MeshPhongMaterial({ 
    color: 0x228B22 
  }),
  fern: new THREE.MeshPhongMaterial({ 
    color: 0x32CD32 
  }),
  vine: new THREE.MeshPhongMaterial({ 
    color: 0x556B2F 
  })
};

export const TreeMaterials = {
  trunks: [
    new THREE.MeshPhongMaterial({ color: 0x8B4513 }),
    new THREE.MeshPhongMaterial({ color: 0x654321 }),
    new THREE.MeshPhongMaterial({ color: 0x5D4E37 }),
    new THREE.MeshPhongMaterial({ color: 0x8B7355 })
  ],
  foliage: [
    new THREE.MeshPhongMaterial({ color: 0x228B22 }),
    new THREE.MeshPhongMaterial({ color: 0x006400 }),
    new THREE.MeshPhongMaterial({ color: 0x32CD32 }),
    new THREE.MeshPhongMaterial({ color: 0x9ACD32 }),
    new THREE.MeshPhongMaterial({ color: 0x00FF7F }),
    new THREE.MeshPhongMaterial({ color: 0x90EE90 })
  ]
};

export const MountainMaterials = {
  far: new THREE.MeshPhongMaterial({ 
    color: 0x4682B4,
    transparent: true,
    opacity: 0.7
  }),
  mid: new THREE.MeshPhongMaterial({ 
    color: 0x6495ED,
    transparent: true,
    opacity: 0.8
  }),
  close: new THREE.MeshPhongMaterial({ 
    color: 0x708090,
    transparent: true,
    opacity: 0.9
  })
};