// Type declarations for pannellum-react
declare module 'pannellum-react' {
  import { Component, CSSProperties } from 'react';

  export interface PannellumProps {
    id?: string;
    image?: string;
    imageSource?: string;
    equirectangularOptions?: {
      haov?: number;
      vaov?: number;
      vOffset?: number;
      ignoreGPanoXMP?: boolean;
    };
    cubeMap?: string[];
    title?: string;
    author?: string;
    orientationOnByDefault?: boolean;
    showZoomCtrl?: boolean;
    showFullscreenCtrl?: boolean;
    autoLoad?: boolean;
    autoRotate?: number;
    autoRotateInactivityDelay?: number;
    autoRotateStopDelay?: number;
    preview?: string;
    previewTitle?: string;
    previewAuthor?: string;
    yaw?: number;
    pitch?: number;
    hfov?: number;
    minYaw?: number;
    maxYaw?: number;
    minPitch?: number;
    maxPitch?: number;
    minHfov?: number;
    maxHfov?: number;
    mouseZoom?: boolean;
    doubleClickZoom?: boolean;
    keyboardZoom?: boolean;
    compass?: boolean;
    northOffset?: number;
    hotSpots?: Array<{
      pitch: number;
      yaw: number;
      type: 'scene' | 'info';
      text?: string;
      URL?: string;
      sceneId?: string;
      targetPitch?: number;
      targetYaw?: number;
      targetHfov?: number;
    }>;
    hotSpotDebug?: boolean;
    onLoad?: () => void;
    onScenechange?: (sceneId: string) => void;
    onScenechangefadedone?: () => void;
    onError?: (err: Error) => void;
    onErrorcleared?: () => void;
    onMousedown?: (event: MouseEvent) => void;
    onMouseup?: (event: MouseEvent) => void;
    onTouchstart?: (event: TouchEvent) => void;
    onTouchend?: (event: TouchEvent) => void;
    style?: CSSProperties;
    className?: string;
  }

  export class Pannellum extends Component<PannellumProps> {}
}
