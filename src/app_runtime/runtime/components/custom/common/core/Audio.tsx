import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import type { AudioProps } from '../../../../../interfaces/components/common/core';
import { cn } from '@/lib/utils';

/**
 * Audio - A basic audio element with playback controls
 */
export const Audio = forwardRef<HTMLAudioElement, AudioProps & { onClick?: () => void }>(
  (
    {
      source,
      controls = true,
      autoplay = false,
      loop = false,
      muted = false,
      volume = 1,
      onPlay,
      onPause,
      onEnd,
      classes,
      componentType = 'Audio',
      onClick,
      ...props
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [currentVolume, setCurrentVolume] = useState(volume || 1);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Combine refs
    const combinedRef = (node: HTMLAudioElement | null) => {
      if (audioRef.current !== node) {
        (audioRef as React.MutableRefObject<HTMLAudioElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLAudioElement | null>).current = node;
      }
    };

    // Handle audio events
    const handlePlay = useCallback(() => {
      setIsPlaying(true);
      // if (onPlay) {
      //   onPlay();
      // }
    }, [onPlay]);

    const handlePause = useCallback(() => {
      setIsPlaying(false);
      // if (onPause) {
      //   onPause();
      // }
    }, [onPause]);

    const handleEnded = useCallback(() => {
      setIsPlaying(false);
      // if (onEnd) {
      //   onEnd();
      // }
    }, [onEnd]);

    const handleLoadedMetadata = useCallback(() => {
      if (!audioRef.current) return;

      // Set initial volume
      audioRef.current.volume = currentVolume;
      audioRef.current.muted = muted;

      // Autoplay if enabled
      if (autoplay) {
        audioRef.current.play().catch(err => {
          console.error('Error autoplaying audio:', err);
        });
      }
    }, [currentVolume, muted, autoplay]);

    // Update volume when prop changes
    useEffect(() => {
      if (audioRef.current && volume !== undefined) {
        audioRef.current.volume = volume;
        setCurrentVolume(volume);
      }
    }, [volume]);

    return React.createElement('audio', {
      ref: combinedRef,
      src: source,
      controls,
      autoPlay: autoplay,
      loop,
      muted,
      className: cn('w-full', classes),
      onPlay: handlePlay,
      onPause: handlePause,
      onEnded: handleEnded,
      onLoadedMetadata: handleLoadedMetadata,
      onClick,
      ...props
    });
  }
);

Audio.displayName = 'Audio';
