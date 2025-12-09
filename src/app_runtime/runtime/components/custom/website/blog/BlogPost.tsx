// components/website/blog/BlogPost.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, filterDOMProps } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/runtime/components/ui/alert';
import { Skeleton } from '@/runtime/components/ui/skeleton';
import { Button } from '@/runtime/components/ui/button';
import { Badge } from '@/runtime/components/ui/badge';
import { Separator } from '@/runtime/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/runtime/components/ui/dropdown-menu';
import { DynamicRendererList } from '@/components/DynamicRenderer';
import { BlogPostPageProps } from '@/interfaces/components/website/blog/blog';
import { ComponentProps } from '@/interfaces/components/common/core';
import { getLayoutClasses } from '@/utils/layoutPatterns';
import { useAppContext } from '@/context/AppContext';
import { 
  AlertCircle,
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Tag as TagIcon,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from 'lucide-react';

/**
 * Component for displaying a single blog post.
 * Can work in two modes:
 * 1. Static mode: Uses content prop directly (for static/example apps)
 * 2. Dynamic mode: Fetches from /api/blogs/blog-post endpoint (for production with backend)
 */
export const BlogPost: React.FC<BlogPostPageProps & { 
  postSlug?: string;
  blog_uuid?: string;
  app_uuid?: string;
}> = ({
  postSlug,
  blog_uuid,
  classes,
  // Destructure BlogPostPageProps props to prevent them from being spread to DOM
  publishedDate,
  updatedDate,
  status,
  featuredImage,
  categories,
  tags,
  readingTimeMinutes,
  isFeatured,
  app_uuid,
  uuid,
  pageType,
  title,
  slug,
  summary,
  shortSummary,
  content,
  layout,
  lastUpdatedEpoch,
  metadata,
  transitions,
  signature,
  ...restProps
}) => {
  const { basePath, mode } = useAppContext();
  const [pageConfig, setPageConfig] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const hasStaticContent = content && content.length > 0;

  // Fetch blog post config from backend (only if no static content)
  const fetchPost = async () => {
    // Skip fetching if we already have static content
    if (hasStaticContent) {
      console.log('[BlogPost] Using static content, skipping API fetch');
      setPageConfig({
        uuid,
        title,
        slug,
        summary,
        shortSummary,
        content,
        layout,
        metadata,
        publishedDate,
        updatedDate,
        status,
        featuredImage,
        categories,
        tags,
        readingTimeMinutes,
        isFeatured,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate that we have the required authentication parameters
      if (!app_uuid) {
        throw new Error('Missing authentication parameter (app_uuid)');
      }

      if (!postSlug) {
        throw new Error('Missing post slug parameter');
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = `${apiBaseUrl}/api/blogs/blog-post`;
      
      // Ensure slug has a leading slash
      const normalizedSlug = postSlug.startsWith('/') ? postSlug : `/${postSlug}`;
      
      const params = new URLSearchParams({
        app_uuid: app_uuid,
        slug: normalizedSlug,
        mode: mode || 'deployed', // Pass mode to backend to handle preview/deployed
      });

      // Step 1: Fetch the config URL from the backend
      const response = await fetch(`${endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error(`Failed to fetch blog post: ${response.status}`);
      }

      const data = await response.json();
      
      // Step 2: Fetch the actual config from the config_url
      if (!data.config_url) {
        throw new Error('Config URL not provided by the backend');
      }

      const configResponse = await fetch(data.config_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!configResponse.ok) {
        throw new Error(`Failed to fetch config from URL: ${configResponse.status}`);
      }

      const configData = await configResponse.json();
      setPageConfig(configData);

    } catch (err: any) {
      console.error('[BlogPost] Error fetching post:', err);
      setError(err.message || 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  // Initial load - only fetch if no static content
  useEffect(() => {
    fetchPost();
  }, [postSlug, app_uuid, hasStaticContent]);

  // Send actual UUID to parent when blog post config is loaded
  // This corrects the temporary UUID set in unifiedConfig.ts
  useEffect(() => {
    if (pageConfig?.uuid && pageConfig.uuid !== uuid && app_uuid) {
      // The loaded config has a different UUID than the temporary one
      // Send it to the parent window to update the page UUID
      try {
        if (typeof window !== 'undefined' && window.parent) {
          window.parent.postMessage({
            type: 'page_changed',
            pageUuid: pageConfig.uuid,
            appId: app_uuid,
            source: 'leapdo-runtime'
          }, '*');
          console.log('[BlogPost] Sent actual UUID to parent:', pageConfig.uuid);
        }
      } catch (error) {
        console.error('[BlogPost] Failed to send UUID update:', error);
      }
    }
  }, [pageConfig?.uuid, uuid, app_uuid]);

  // Get the current URL for sharing
  const getCurrentUrl = () => {
    return typeof window !== 'undefined' ? window.location.href : '';
  };

  // Share handlers
  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && pageConfig) {
      navigator.share({
        title: pageConfig.title,
        text: pageConfig.summary,
        url: getCurrentUrl(),
      }).catch(err => console.log('Error sharing:', err));
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getCurrentUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getCurrentUrl());
    const text = encodeURIComponent(pageConfig?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(getCurrentUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getCurrentUrl());
    const text = encodeURIComponent(pageConfig?.title || '');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className={cn('w-full', classes)} {...filterDOMProps(restProps)}>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="w-full h-96 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('w-full', classes)} {...filterDOMProps(restProps)}>
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Render page not found
  if (!pageConfig) {
    return (
      <div className={cn('w-full', classes)} {...filterDOMProps(restProps)}>
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Blog post configuration not available.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Helper function to validate image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    // Check if it's a valid URL format for Next.js Image
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
  };

  // Extract data from page config
  const pageContent = pageConfig.content || [];
  const pageLayout = pageConfig.layout || layout;
  const post = {
    title: pageConfig.title,
    summary: pageConfig.summary,
    publishedDate: pageConfig.publishedDate,
    updatedDate: pageConfig.updatedDate,
    readingTimeMinutes: pageConfig.readingTimeMinutes,
    categories: pageConfig.categories || [],
    tags: pageConfig.tags || [],
    featuredImage: pageConfig.featuredImage,
  };
  
  return (
    <article className={cn('py-12', classes)} {...filterDOMProps(restProps)}>
      <div className="container mx-auto px-4">
        
        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category: any) => (
                <Badge key={category.slug} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Summary */}
          {post.summary && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.summary}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Published Date */}
              {post.publishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.publishedDate}>
                    {new Date(post.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              )}

              {/* Reading Time */}
              {post.readingTimeMinutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTimeMinutes} min read</span>
                </div>
              )}
            </div>

            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator && (
                  <>
                    <DropdownMenuItem onClick={handleNativeShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      <span>Share...</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={handleShareFacebook}>
                  <Facebook className="w-4 h-4 mr-2" />
                  <span>Facebook</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareTwitter}>
                  <Twitter className="w-4 h-4 mr-2" />
                  <span>Twitter / X</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareLinkedIn}>
                  <Linkedin className="w-4 h-4 mr-2" />
                  <span>LinkedIn</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span>WhatsApp</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator className="mt-8" />
        </header>

        {/* Featured Image */}
        {post.featuredImage && isValidImageUrl(post.featuredImage.src) && (
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage.src}
                alt={post.featuredImage.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {post.featuredImage.alt && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                {post.featuredImage.alt}
              </p>
            )}
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className={getLayoutClasses(pageLayout)}>
            <DynamicRendererList components={pageContent} pageLayout={pageLayout} />
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <Separator className="mb-6" />
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags:</span>
              {post.tags.map((tag: any) => (
                <Badge key={tag.slug} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link href={`${basePath}/blog`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

      </div>
    </article>
  );
};

BlogPost.displayName = 'BlogPost';

export default BlogPost;

