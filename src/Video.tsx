import React from 'react';
import { Composition } from 'remotion';
import { JungleWalk } from './compositions/JungleWalk';
import { CinematicJungleWalk } from './compositions/CinematicJungleWalk';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="JungleWalk"
        component={JungleWalk}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CinematicJungleWalk"
        component={CinematicJungleWalk}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};