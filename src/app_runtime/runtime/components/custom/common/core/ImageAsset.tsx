import React from 'react';
import type { ImageAssetProps } from '../../../../../interfaces/components/common/core';

type ImageAssetComponentProps = ImageAssetProps & {
  componentType?: 'ImageAsset';
};

export function ImageAsset({
  componentType = 'ImageAsset',
  ...props
}: ImageAssetComponentProps) {
  // ImageAsset is metadata and should not render anything
  return null;
}

export default ImageAsset; 