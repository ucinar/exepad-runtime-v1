import { ComponentProps, ImageProps, LinkProps } from "@/interfaces/components/common/core";
import { PageProps } from "@/interfaces/apps/page";

export type BlogLayout = 'singleColumn' | 'twoColumn' | 'masonry' | 'grid' | 'featuredList' | 'timeline';
export type PaginationType = 'pages' | 'loadMore' | 'infiniteScroll';


/**The main component for displaying a blog listing page. */
export interface BlogMainPageProps extends PageProps {
    /** The type of the page. Explicitly set to 'BlogMainPageProps'. */
    pageType: 'BlogMainPageProps';

    /** The visual arrangement of the blog posts. */
    blogLayout?: BlogLayout;
    
    /** An optional subtitle for more context. */
    subtitle?: string;
    
    /** The number of posts to display per page. Defaults to 10. */
    postsPerPage?: number;
    
    /** The style of pagination to use. */
    paginationType?: PaginationType;
    
    /** Defines the number of columns for grid or masonry layouts. */
    gridColumns?: 2 | 3 | 4;
    
    /** The ID of a specific post to feature in the 'featuredList' layout. */
    featuredPostId?: string | number;
 
}

/**
 * Represents a category or tag associated with a blog post.
 */
export interface TaxonomyTerm {
    /** The display name of the term (e.g., "Web Development"). */
    name: string;
    /** The URL-friendly identifier for the term's archive page. */
    slug: string;
}


/**
 * Defines the properties for a single blog post component.
 * This interface contains all the data needed to render a complete blog article,
 * from its content and author to its metadata and SEO details.
 */
export interface BlogPostPageProps extends PageProps {
    /** The type of the page. Explicitly set to 'BlogPostPageProps'. */
    pageType: 'BlogPostPageProps';

    /** The main image for the post, often displayed at the top. */
    featuredImage?: ImageProps;
    
    /** The date the post was originally published, in ISO 8601 format. */
    publishedDate: string;
    
    /** The date the post was last updated, in ISO 8601 format. */
    updatedDate?: string;
    
    /** An array of categories the post belongs to. */
    categories?: TaxonomyTerm[];
    
    /** An array of tags associated with the post. */
    tags?: TaxonomyTerm[];
    
    /** An estimated reading time for the article in minutes. */
    readingTimeMinutes?: number;
    
    /** A flag to indicate if this is a featured or highlighted post. */
    isFeatured?: boolean;
    
    /** The current status of the post (e.g., for conditional rendering). */
    status: 'published' | 'draft' | 'archived';

}