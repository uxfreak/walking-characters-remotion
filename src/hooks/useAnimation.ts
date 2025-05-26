import { useRef, useCallback } from 'react';

export interface AnimationState {
  isPlaying: boolean;
  frame: number;
  time: number;
  deltaTime: number;
}

export interface UseAnimationReturn {
  state: AnimationState;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useAnimation(
  onFrame: (state: AnimationState) => void,
  fps: number = 60
): UseAnimationReturn {
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef<AnimationState>({
    isPlaying: false,
    frame: 0,
    time: 0,
    deltaTime: 0
  });
  const lastTimeRef = useRef<number>(0);
  
  const animate = useCallback((timestamp: number) => {
    if (!stateRef.current.isPlaying) return;
    
    // Calculate delta time
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;
    
    // Update state
    stateRef.current.deltaTime = deltaTime;
    stateRef.current.time += deltaTime;
    stateRef.current.frame++;
    
    // Call frame callback
    onFrame(stateRef.current);
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  }, [onFrame]);
  
  const start = useCallback(() => {
    if (stateRef.current.isPlaying) return;
    
    stateRef.current.isPlaying = true;
    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);
  
  const stop = useCallback(() => {
    stateRef.current.isPlaying = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  const toggle = useCallback(() => {
    if (stateRef.current.isPlaying) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);
  
  const reset = useCallback(() => {
    stop();
    stateRef.current.frame = 0;
    stateRef.current.time = 0;
    stateRef.current.deltaTime = 0;
    lastTimeRef.current = 0;
  }, [stop]);
  
  return {
    state: stateRef.current,
    start,
    stop,
    toggle,
    reset
  };
}