import React, { forwardRef, useState, useRef, useCallback, useEffect } from 'react';
import type { VideoProps } from '../../../../../interfaces/components/common/core';
import { cn } from '@/lib/utils';

/**
 * Video - A basic video element with controls and playback options
 */
export const Video = forwardRef<HTMLVideoElement, VideoProps & { onClick?: () => void }>(
  (
    {
      source,
      provider = 'file',
      poster,
      controls = true,
      autoplay = false,
      loop = false,
      muted = false,
      startTime,
      endTime,
      width,
      height,
      onPlay,
      onPause,
      onEnd,
      classes,
      componentType = 'Video',
      onClick,
      // Filter out non-DOM props
      uuid,
      lastUpdatedEpoch,
      signature,
      ...props
    },
    ref
  ) => {
    const [currentTime, setCurrentTime] = useState(startTime || 0);
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Combine refs
    const combinedRef = (node: HTMLVideoElement | null) => {
      if (videoRef.current !== node) {
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      }
    };

    // Handle video events
    const handlePlay = useCallback(() => {
      setIsPlaying(true);
      // Event handler logic would go here
    }, [onPlay]);

    const handlePause = useCallback(() => {
      setIsPlaying(false);
      // Event handler logic would go here
    }, [onPause]);

    const handleEnded = useCallback(() => {
      setIsPlaying(false);
      // Event handler logic would go here
    }, [onEnd]);

    const handleTimeUpdate = useCallback(() => {
      if (!videoRef.current) return;

      const newTime = videoRef.current.currentTime;
      setCurrentTime(newTime);

      if (typeof endTime === 'number' && newTime >= endTime) {
        videoRef.current.pause();
      }
    }, [endTime, onEnd]);

    const handleLoadedMetadata = useCallback(() => {
      if (!videoRef.current) return;

      if (typeof startTime === 'number') {
        videoRef.current.currentTime = startTime;
        setCurrentTime(startTime);
      }

      if (autoplay) {
        videoRef.current.play().catch(err => {
          console.error('Error autoplaying video:', err);
        });
      }
    }, [startTime, autoplay]);

    // Get video source based on provider
    const getVideoSource = () => {
      if (provider === 'file') {
        return source;
      }
      console.warn(`Provider "${provider}" not fully supported. Using source directly.`);
      return source;
    };

    // Handle different providers
    if (provider === 'youtube') {
      const videoId = source.includes('youtube.com')
        ? new URL(source).searchParams.get('v')
        : source;

      return React.createElement('iframe', {
        ref: combinedRef,
        src: `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}${startTime ? `&start=${startTime}` : ''}${endTime ? `&end=${endTime}` : ''}`,
        width: width || 560,
        height: height || 315,
        // FIX: Removed 'h-auto' which was overriding the height attribute.
        className: cn('w-full', classes),
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullScreen: true,
        onClick,
        ...props
      });
    }

    if (provider === 'vimeo') {
      const videoId = source.includes('vimeo.com')
        ? source.split('/').pop()
        : source;

      return React.createElement('iframe', {
        ref: combinedRef,
        src: `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}${startTime ? `#t=${startTime}s` : ''}`,
        width: width || 560,
        height: height || 315,
        // FIX: Removed 'h-auto' which was overriding the height attribute.
        className: cn('w-full', classes),
        allow: 'autoplay; fullscreen; picture-in-picture',
        allowFullScreen: true,
        onClick,
        ...props
      });
    }

    // Default file provider - use HTML5 video element
    return React.createElement('video', {
      ref: combinedRef,
      src: getVideoSource(),
      poster: poster?.src,
      controls,
      autoPlay: autoplay,
      loop,
      muted,
      width,
      height,
      // FIX: Removed 'h-auto' for consistency.
      className: cn('w-full', classes),
      onPlay: handlePlay,
      onPause: handlePause,
      onEnded: handleEnded,
      onTimeUpdate: handleTimeUpdate,
      onLoadedMetadata: handleLoadedMetadata,
      onClick,
      ...props
    });
  }
);

Video.displayName = 'Video';
