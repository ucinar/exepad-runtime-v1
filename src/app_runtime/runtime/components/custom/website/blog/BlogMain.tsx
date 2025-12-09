// components/website/blog/BlogMain.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, filterDOMProps } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/runtime/components/ui/card';
import { Button } from '@/runtime/components/ui/button';
import { Badge } from '@/runtime/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/runtime/components/ui/alert';
import { Skeleton } from '@/runtime/components/ui/skeleton';
import { BlogMainPageProps } from '@/interfaces/components/website/blog/blog';
import { Clock, Calendar, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  summary: string;
  featuredImage?: {
    src: string;
    alt: string;
  };
  publishedDate: string;
  categories?: Array<{ name: string; slug: string }>;
  tags?: Array<{ name: string; slug: string }>;
  readingTimeMinutes?: number;
  isFeatured?: boolean;
}

interface BlogMainResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * The main component for displaying a blog listing page.
 * Fetches blog posts from /api/blog-main and displays them in various layouts.
 */
export const BlogMain: React.FC<BlogMainPageProps & { app_uuid?: string }> = ({
  blogLayout = 'grid',
  title = 'Blog',
  subtitle,
  postsPerPage = 10,
  paginationType = 'pages',
  gridColumns = 3,
  featuredPostId,
  classes,
  slug,
  summary,
  content,
  layout,
  app_uuid,
  uuid,
  ...restProps
}) => {
  const { basePath } = useAppContext();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch blog posts from backend
  const fetchPosts = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Validate that we have the required authentication parameters
      if (!app_uuid || !uuid) {
        throw new Error('Missing authentication parameters (app_uuid or blog_uuid)');
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = `${apiBaseUrl}/api/blogs/blog-main`;
      
      const params = new URLSearchParams({
        app_uuid: app_uuid,
        blog_uuid: uuid,
        page: page.toString(),
        per_page: postsPerPage.toString(),
        ...(featuredPostId && { featured_post_id: featuredPostId.toString() })
      });

      const response = await fetch(`${endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.status}`);
      }

      const data: BlogMainResponse = await response.json();

      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);

    } catch (err: any) {
      console.error('[BlogMain] Error fetching posts:', err);
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [postsPerPage, featuredPostId, app_uuid, uuid]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchPosts(currentPage + 1, true);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    const skeletonCount = Math.min(postsPerPage, 6);
    return (
      <div className={cn(
        'grid gap-6',
        gridColumns === 2 && 'md:grid-cols-2',
        gridColumns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
        gridColumns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
      )}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render a single blog post card
  const renderPostCard = (post: BlogPost, featured: boolean = false) => (
    <Card 
      key={post.id} 
      className={cn(
        'overflow-hidden hover:shadow-lg transition-shadow duration-300',
        featured && 'md:col-span-2 lg:col-span-3'
      )}
    >
      {post.featuredImage && (
        <div className={cn('relative w-full', featured ? 'h-96' : 'h-48')}>
          <Image
            src={post.featuredImage.src}
            alt={post.featuredImage.alt}
            fill
            className="object-cover"
          />
          {post.isFeatured && (
            <Badge className="absolute top-4 right-4 bg-primary">Featured</Badge>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="w-4 h-4" />
          <time dateTime={post.publishedDate}>
            {new Date(post.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {post.readingTimeMinutes && (
            <>
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4" />
              <span>{post.readingTimeMinutes} min read</span>
            </>
          )}
        </div>
        <CardTitle className={cn('line-clamp-2', featured && 'text-3xl')}>
          <Link 
            href={`${basePath}/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className={cn('line-clamp-3 mt-2', featured && 'text-base')}>
          {post.summary}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories?.slice(0, 3).map((category) => (
            <Badge key={category.slug} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
        <Link href={`${basePath}/blog/${post.slug}`}>
          <Button variant="ghost" className="group">
            Read More
            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  // Render posts based on layout
  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts available yet.</p>
        </div>
      );
    }

    const featuredPost = featuredPostId 
      ? posts.find(p => p.id === featuredPostId)
      : posts.find(p => p.isFeatured);
    
    const regularPosts = featuredPost 
      ? posts.filter(p => p.id !== featuredPost.id)
      : posts;

    switch (blogLayout) {
      case 'singleColumn':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            {posts.map(post => renderPostCard(post))}
          </div>
        );

      case 'twoColumn':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map(post => renderPostCard(post))}
          </div>
        );

      case 'featuredList':
        return (
          <div className="space-y-6">
            {featuredPost && (
              <div className="mb-8">
                {renderPostCard(featuredPost, true)}
              </div>
            )}
            <div className={cn(
              'grid gap-6',
              gridColumns === 2 && 'md:grid-cols-2',
              gridColumns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
              gridColumns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
            )}>
              {regularPosts.map(post => renderPostCard(post))}
            </div>
          </div>
        );

      case 'masonry':
        return (
          <div className={cn(
            'columns-1 gap-6 space-y-6',
            gridColumns === 2 && 'md:columns-2',
            gridColumns === 3 && 'md:columns-2 lg:columns-3',
            gridColumns === 4 && 'md:columns-2 lg:columns-4'
          )}>
            {posts.map(post => (
              <div key={post.id} className="break-inside-avoid">
                {renderPostCard(post)}
              </div>
            ))}
          </div>
        );

      case 'timeline':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {posts.map((post, index) => (
              <div key={post.id} className="relative pl-8 border-l-2 border-muted">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                {renderPostCard(post)}
              </div>
            ))}
          </div>
        );

      case 'grid':
      default:
        return (
          <div className={cn(
            'grid gap-6',
            gridColumns === 2 && 'md:grid-cols-2',
            gridColumns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
            gridColumns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
          )}>
            {posts.map(post => renderPostCard(post))}
          </div>
        );
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    switch (paginationType) {
      case 'loadMore':
        return currentPage < totalPages ? (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              size="lg"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Posts'
              )}
            </Button>
          </div>
        ) : null;

      case 'infiniteScroll':
        // Infinite scroll would require IntersectionObserver
        // For now, show load more button
        return currentPage < totalPages ? (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        ) : null;

      case 'pages':
      default:
        return (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="px-2">...</span>}
            </div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <section className={cn('py-12', classes)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {loading ? renderSkeleton() : renderPosts()}

        {/* Pagination */}
        {!loading && !error && renderPagination()}
      </div>
    </section>
  );
};

BlogMain.displayName = 'BlogMain';

export default BlogMain;

