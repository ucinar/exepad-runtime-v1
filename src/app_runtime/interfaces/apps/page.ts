import { ComponentProps } from '../components/common/core';
import { PageTransition } from './transitions';
import {MetadataProps,LayoutOption} from "./core";

export type PageType = 'WebPageProps' | 'BlogMainPageProps' | 'BlogPostPageProps';

/**
 * Page interface
 */
export interface PageProps {
    /** Required unique identifier for the instance, assign randomly */
    uuid: string;
    /** Page type */
    pageType: PageType;
    /** Page title */
    title: string;
    /** Page slug/route/path to the page, e.g. /about */
    slug: string;
    /** Comprehensive summary of the page, visible to the user. This is not the SEO summary. */
    summary: string;
    /** Short summary of the page, ony one sentence, visible to the user. This is not the SEO summary. */
    shortSummary: string;
    /** Last updated timestamp in epoch seconds, managed by the backend */
    lastUpdatedEpoch: number;
    /** Page content components */
    content: ComponentProps[];
    /** Optional styling hook */
    classes?: string;
    /** Page-specific metadata that overrides site-wide defaults. */
    metadata?: MetadataProps;
    /** Page layout pattern - overrides app default */
    layout?: LayoutOption;
    /** Page-specific transition overrides */
    transitions?: PageTransition;
    /** Signature of the page. */
    signature?: string;
}

/**
 * A standard web page.
 * This interface extends PageProps without additional properties,
 * serving as a distinct type in the PageType discriminated union.
 */
export interface WebPageProps extends PageProps{

}

/**
 * A blog main/listing page that displays multiple blog posts.
 * This interface extends PageProps without additional properties,
 * serving as a distinct type in the PageType discriminated union.
 */
export interface BlogMainPageProps extends PageProps{

}

/**
 * A single blog post page with article content.
 * This interface extends PageProps without additional properties,
 * serving as a distinct type in the PageType discriminated union.
 */
export interface BlogPostPageProps extends PageProps{

}