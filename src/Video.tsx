import React from 'react';
import { Composition } from 'remotion';
import { JungleWalk } from './compositions/JungleWalk';
import { CinematicJungleWalk } from './compositions/CinematicJungleWalk';
import { calculateJungleWalkMetadata, JungleWalkProps } from './utils/metadataCalculator';
import { defaultSceneConfig } from './data/sceneConfig';

export const RemotionVideo = () => {
  return (
    <>
      <Composition<JungleWalkProps>
        id="JungleWalk"
        component={JungleWalk}
        durationInFrames={900} // Default 30 seconds at 30fps (will be overridden by calculateMetadata)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sceneConfig: defaultSceneConfig,
          fps: 30,
          width: 1920,
          height: 1080,
        }}
        calculateMetadata={calculateJungleWalkMetadata}
      />
      <Composition<JungleWalkProps>
        id="CinematicJungleWalk"
        component={CinematicJungleWalk}
        durationInFrames={900} // Default 30 seconds at 30fps (will be overridden by calculateMetadata)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sceneConfig: defaultSceneConfig,
          fps: 30,
          width: 1920,
          height: 1080,
        }}
        calculateMetadata={calculateJungleWalkMetadata}
      />
    </>
  );
};