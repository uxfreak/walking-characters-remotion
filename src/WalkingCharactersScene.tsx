import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneSetup } from './components/scene/SceneSetup';
import { OrbitControls } from './components/controls/OrbitControls';
import { Character } from './components/characters/Character';
import { CharacterAnimations, Speaker } from './components/characters/CharacterAnimations';
import { JungleEnvironment } from './components/environment/Jungle';
import { CameraShot } from './constants/cameraShots';

export interface WalkingCharactersSceneProps {
  frame?: number;
  fps?: number;
  currentSpeaker?: Speaker;
  cameraShot?: CameraShot;
  enableControls?: boolean; // For development/preview
}

export default function WalkingCharactersScene({ 
  frame = 0, 
  fps = 30,
  currentSpeaker = Speaker.NONE,
  cameraShot,
  enableControls = false
}: WalkingCharactersSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneSetupRef = useRef<SceneSetup | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const character1Ref = useRef<{ character: Character; animations: CharacterAnimations } | null>(null);
  const character2Ref = useRef<{ character: Character; animations: CharacterAnimations } | null>(null);
  const jungleRef = useRef<JungleEnvironment | null>(null);
  
  const walkSpeed = 0.7;
  
  // Animation function based on frame
  const animateFrame = (frameNumber: number) => {
    if (!sceneSetupRef.current) return;
    
    const time = frameNumber / fps;
    
    // Update character animations with speaker info
    if (character1Ref.current) {
      character1Ref.current.animations.update(time, 0, currentSpeaker);
    }
    if (character2Ref.current) {
      character2Ref.current.animations.update(time, 1, currentSpeaker);
    }
    
    // Update camera based on shot or controls
    if (cameraShot && sceneSetupRef.current) {
      // Apply camera shot settings
      sceneSetupRef.current.camera.position.copy(cameraShot.position);
      sceneSetupRef.current.camera.lookAt(cameraShot.target);
      if (cameraShot.fov) {
        sceneSetupRef.current.camera.fov = cameraShot.fov;
        sceneSetupRef.current.camera.updateProjectionMatrix();
      }
    } else if (!cameraShot && !enableControls && sceneSetupRef.current) {
      // Default camera position when no shot is specified
      sceneSetupRef.current.camera.position.set(-3, 4, 8);
      sceneSetupRef.current.camera.lookAt(0, 2, 0);
    } else if (enableControls && controlsRef.current && character1Ref.current && character2Ref.current) {
      // Only update camera with controls if enabled
      const followSpeed = 0.02;
      const targetX = (
        character1Ref.current.character.position.x + 
        character2Ref.current.character.position.x
      ) / 2;
      
      const currentTarget = controlsRef.current.target.clone();
      currentTarget.x += (targetX - currentTarget.x) * followSpeed;
      
      // Slight camera movement for cinematic effect
      const cameraFloat = Math.sin(time * 0.3) * 0.1;
      currentTarget.y = 2 + cameraFloat;
      
      controlsRef.current.setTarget(currentTarget);
    }
    
    // Update jungle environment based on frame distance
    if (jungleRef.current) {
      const frameDistance = frameNumber * walkSpeed / fps;
      jungleRef.current.updateByFrame(frameDistance);
    }
    
    // Update controls if enabled and render
    if (enableControls && controlsRef.current) {
      controlsRef.current.update();
    }
    sceneSetupRef.current.render();
  };
  
  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Wait for container to have dimensions
    const checkDimensions = () => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(checkDimensions);
        return;
      }
      initializeScene();
    };
    
    const initializeScene = () => {
      if (!mountRef.current) return;
    
    try {
      // Create scene setup
      const sceneSetup = new SceneSetup({
        backgroundColor: 0x8FBC8F,
        fogColor: 0x7A9B7A,
        fogNear: 25,
        fogFar: 80,
        enableShadows: true
      });
      sceneSetupRef.current = sceneSetup;
      sceneSetup.mount(mountRef.current);
    } catch (error) {
      console.error('Failed to initialize WebGL scene:', error);
      // For Remotion rendering, we need WebGL
      if (typeof window !== 'undefined' && !window.WebGLRenderingContext) {
        console.error('WebGL is not supported in this environment');
      }
      return;
    }
    
    // Create controls only if enabled
    if (enableControls) {
      const controls = new OrbitControls(
        sceneSetup.camera,
        sceneSetup.renderer.domElement,
        {
          target: new THREE.Vector3(0, 2, 0),
          minDistance: 5,
          maxDistance: 20
        }
      );
      controlsRef.current = controls;
    }
    
    // Create jungle environment
    const jungle = new JungleEnvironment(sceneSetup.scene);
    jungleRef.current = jungle;
    
    // Create characters
    const character1 = new Character();
    character1.position.set(-0.8, 0, 0);
    const character1Animations = new CharacterAnimations(character1, 0);
    character1Ref.current = { character: character1, animations: character1Animations };
    sceneSetup.scene.add(character1);
    
    const character2 = new Character();
    character2.position.set(0.8, 0, 0);
    const character2Animations = new CharacterAnimations(character2, Math.PI);
    character2Ref.current = { character: character2, animations: character2Animations };
    sceneSetup.scene.add(character2);
    
    // Initial render
    sceneSetup.render();
    };
    
    checkDimensions();
    
    return () => {
      if (mountRef.current && sceneSetupRef.current) {
        sceneSetupRef.current.unmount(mountRef.current);
        sceneSetupRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);
  
  // Update animation when frame or speaker changes
  useEffect(() => {
    if (sceneSetupRef.current) {
      animateFrame(frame);
    }
  }, [frame, currentSpeaker, fps, cameraShot]);
  
  
  
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#8FBC8F', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
}