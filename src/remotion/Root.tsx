import React from 'react';
import { Composition } from 'remotion';
import { Reel, type ReelProps } from './Reel';
import sample from './sample.json';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DesignReel"
    component={Reel as any}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={14 * FPS}
    defaultProps={sample as unknown as ReelProps & { seconds?: number }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(((props as any).seconds ?? 14) * FPS) })}
  />
);
