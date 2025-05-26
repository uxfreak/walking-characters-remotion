import { useRef, useEffect, MutableRefObject } from 'react';
import * as THREE from 'three';
import { SceneSetup } from '../components/scene/SceneSetup';
import { OrbitControls } from '../components/controls/OrbitControls';

export interface UseThreeSceneReturn {
  mountRef: MutableRefObject<HTMLDivElement | null>;
  sceneSetup: SceneSetup | null;
  controls: OrbitControls | null;
}

export function useThreeScene(): UseThreeSceneReturn {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneSetupRef = useRef<SceneSetup | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
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
    
    // Create controls
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
  
  return {
    mountRef,
    sceneSetup: sceneSetupRef.current,
    controls: controlsRef.current
  };
}