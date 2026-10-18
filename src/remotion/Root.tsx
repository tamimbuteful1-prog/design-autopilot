import React from 'react';
import { Composition } from 'remotion';
import { Reel, type ReelProps } from './Reel';
import { ServicesReel, SERVICES_TIMELINE } from './ServicesReel';
import TL from '../shared/timeline.json';
import sample from './sample.json';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DesignReel"
      component={Reel as any}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={TL.totalFrames}
      defaultProps={sample as unknown as ReelProps}
    />
    <Composition
      id="ServicesReel"
      component={ServicesReel as any}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={SERVICES_TIMELINE.total}
      defaultProps={{ ideas: [], handle: '@your.design.studio', cta: 'تواصل معانا على الخاص' } as any}
    />
  </>
);
