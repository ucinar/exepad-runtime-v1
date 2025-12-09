import React from 'react';

/**
 * Component Registry System
 * Maps componentType strings to their corresponding React components,
 * organized by category for better maintainability.
 */
export const componentRegistry: Record<string, () => Promise<React.ComponentType<any>>> = {
  // =================================================================
  // COMMON - CORE COMPONENTS
  // =================================================================
  'AudioProps': () => import('../app_runtime/runtime/components/custom/common/core/Audio').then(m => m.Audio),
  'AvatarProps': () => import('../app_runtime/runtime/components/custom/common/core/Avatar').then(m => m.Avatar),
  'BadgeProps': () => import('../app_runtime/runtime/components/custom/common/core/Badge').then(m => m.Badge),
  'ButtonProps': () => import('../app_runtime/runtime/components/custom/common/core/Button').then(m => m.Button),
  'DividerProps': () => import('../app_runtime/runtime/components/custom/common/core/Divider').then(m => m.Divider),
  'HeadingProps': () => import('../app_runtime/runtime/components/custom/common/core/Heading').then(m => m.Heading),
  'IconProps': () => import('../app_runtime/runtime/components/custom/common/core/Icon').then(m => m.Icon),
  'ImageProps': () => import('../app_runtime/runtime/components/custom/common/core/Image').then(m => m.Image),
  'ImageAssetProps': () => import('../app_runtime/runtime/components/custom/common/core/ImageAsset').then(m => m.ImageAsset),
  'LinkProps': () => import('../app_runtime/runtime/components/custom/common/core/Link').then(m => m.Link),
  'SkeletonProps': () => import('../app_runtime/runtime/components/custom/common/core/Skeleton').then(m => m.Skeleton),
  'SpacerProps': () => import('../app_runtime/runtime/components/custom/common/core/Spacer').then(m => m.Spacer),
  'SpinnerProps': () => import('../app_runtime/runtime/components/custom/common/core/Spinner').then(m => m.Spinner),
  'TextProps': () => import('../app_runtime/runtime/components/custom/common/core/Text').then(m => m.Text),
  'VideoProps': () => import('../app_runtime/runtime/components/custom/common/core/Video').then(m => m.Video),
  'TagProps': () => import('../app_runtime/runtime/components/custom/common/core/Tag').then(m => m.Tag),
  
  // =================================================================
  // COMMON - FEEDBACK COMPONENTS
  // =================================================================
  'AlertItemProps': () => import('../app_runtime/runtime/components/custom/common/feedback/AlertItem').then(m => m.AlertItem),
  'CalloutProps': () => import('../app_runtime/runtime/components/custom/common/feedback/Callout').then(m => m.Callout),
  'CircularProgressProps': () => import('../app_runtime/runtime/components/custom/common/feedback/CircularProgress').then(m => m.CircularProgress),
  'CookieConsentBannerProps': () => import('../app_runtime/runtime/components/custom/common/feedback/CookieConsentBanner').then(m => m.CookieConsentBanner),
  'LoaderProps': () => import('../app_runtime/runtime/components/custom/common/feedback/Loader').then(m => m.Loader),
  'LoadingPlaceholderProps': () => import('../app_runtime/runtime/components/custom/common/feedback/LoadingPlaceholder').then(m => m.LoadingPlaceholder),
  'NotificationBannerProps': () => import('../app_runtime/runtime/components/custom/common/feedback/NotificationBanner').then(m => m.NotificationBanner),
  'ProgressBarProps': () => import('../app_runtime/runtime/components/custom/common/feedback/ProgressBar').then(m => m.ProgressBar),
  'ToastProps': () => import('../app_runtime/runtime/components/custom/common/feedback/Toast').then(m => m.Toast),

  // =================================================================
  // COMMON - LAYOUT COMPONENTS
  // =================================================================
  'AspectRatioProps': () => import('../app_runtime/runtime/components/custom/common/layout/AspectRatio').then(m => m.AspectRatio),
  'CardProps': () => import('../app_runtime/runtime/components/custom/common/layout/Card').then(m => m.Card),
  'CenterProps': () => import('../app_runtime/runtime/components/custom/common/layout/Center').then(m => m.Center),
  'FlexProps': () => import('../app_runtime/runtime/components/custom/common/layout/Flex').then(m => m.Flex),
  'GridProps': () => import('../app_runtime/runtime/components/custom/common/layout/Grid').then(m => m.Grid),
  'SectionProps': () => import('../app_runtime/runtime/components/custom/common/layout/Section').then(m => m.Section),
  'SplitPaneProps': () => import('../app_runtime/runtime/components/custom/common/layout/SplitPane').then(m => m.SplitPane),
  'VirtualListProps': () => import('../app_runtime/runtime/components/custom/common/layout/VirtualList').then(m => m.VirtualList),
  'CarouselProps': () => import('../app_runtime/runtime/components/custom/common/layout/Carousel').then(m => m.CarouselComponent),
  'AccordionProps': () => import('../app_runtime/runtime/components/custom/common/layout/Accordion').then(m => m.AccordionComponent),
  'ResizableBoxProps': () => import('../app_runtime/runtime/components/custom/common/layout/ResizableBox').then(m => m.ResizableBox),
  'MasonryLayoutProps': () => import('../app_runtime/runtime/components/custom/common/layout/MasonryLayout').then(m => m.MasonryLayout),
  'OverflowContainerProps': () => import('../app_runtime/runtime/components/custom/common/layout/OverflowContainer').then(m => m.OverflowContainer),
  // =================================================================
  // COMMON - MEDIA COMPONENTS
  // =================================================================
  'DocumentEmbedProps': () => import('../app_runtime/runtime/components/custom/common/media/DocumentEmbed').then(m => m.DocumentEmbed),
  'LightboxProps': () => import('../app_runtime/runtime/components/custom/common/media/Lightbox').then(m => m.Lightbox),
  'MediaGalleryProps': () => import('../app_runtime/runtime/components/custom/common/media/MediaGallery').then(m => m.MediaGallery),
  'PanoramaViewerProps': () => import('../app_runtime/runtime/components/custom/common/media/PanoramaViewer').then(m => m.PanoramaViewer),
  'PDFViewerProps': () => import('../app_runtime/runtime/components/custom/common/media/PDFViewer').then(m => m.PDFViewer),
  'MediaGalleryItemProps': () => import('../app_runtime/runtime/components/custom/common/media/MediaGalleryItem').then(m => m.MediaGalleryItem),

  // =================================================================
  // COMMON - NAVIGATION COMPONENTS
  // =================================================================
  'NavbarProps': () => import('../app_runtime/runtime/components/custom/common/navigation/Navbar').then(m => m.Navbar),
  'SidebarProps': () => import('../app_runtime/runtime/components/custom/common/navigation/Sidebar').then(m => m.SidebarComponent),
  
  // =================================================================
  // COMMON - FORM COMPONENTS
  // =================================================================
  // Form Container Components
  'FormProps': () => import('../app_runtime/runtime/components/custom/common/form/Form').then(m => m.Form),
  'QuizFormProps': () => import('../app_runtime/runtime/components/custom/common/form/QuizForm').then(m => m.QuizForm),
  
  // Form Field Components - Input Fields
  'TextFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/TextField').then(m => m.TextField),
  'TextAreaFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/TextAreaField').then(m => m.TextAreaField),
  'SelectFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/SelectField').then(m => m.SelectField),
  
  // Form Field Components - Choice Fields
  'CheckboxFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/CheckboxField').then(m => m.CheckboxField),
  'CheckboxGroupFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/CheckboxGroupField').then(m => m.CheckboxGroupField),
  'RadioGroupFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/RadioGroupField').then(m => m.RadioGroupField),
  'SwitchFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/SwitchField').then(m => m.SwitchField),
  
  // Form Field Components - Advanced Input Fields
  'DateTimeFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/DateTimeField').then(m => m.DateTimeField),
  'FileUploadFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/FileUploadField').then(m => m.FileUploadField),
  'SliderFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/SliderField').then(m => m.SliderField),
  'RatingFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/RatingField').then(m => m.RatingField),
  'ColorPickerFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/ColorPickerField').then(m => m.ColorPickerField),
  'SignatureFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/SignatureField').then(m => m.SignatureField),
  
  // Form Field Components - Structural Fields
  'HiddenFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/HiddenField').then(m => m.HiddenField),
  'HeadingFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/HeadingField').then(m => m.HeadingField),
  // Note: DividerProps already registered in CORE section - core Divider handles form dividers
  'FieldSetProps': () => import('../app_runtime/runtime/components/custom/common/form/FieldSet').then(m => m.FieldSet),
  
  // Form Field Components - Quiz/Exam Fields
  'QuizQuestionFieldProps': () => import('../app_runtime/runtime/components/custom/common/form/QuizQuestionField').then(m => m.QuizQuestionField),

  // =================================================================
  // WEBSITE - CONTENT COMPONENTS
  // =================================================================
  'ContactInfoBlockProps': () => import('../app_runtime/runtime/components/custom/website/content/ContactInfoBlock').then(m => m.ContactInfoBlock),
  'FeatureItemProps': () => import('../app_runtime/runtime/components/custom/website/content/FeatureItem').then(m => m.FeatureItem),
  'StandardFeatureProps': () => import('../app_runtime/runtime/components/custom/website/content/FeatureItem').then(m => m.FeatureItem),
  // ChecklistFeature should be rendered by the FeatureItem dispatcher (variant: 'checklist')
  'ChecklistFeatureProps': () => import('../app_runtime/runtime/components/custom/website/content/FeatureItem').then(m => m.FeatureItem),
  'ChecklistItemProps': () => import('../app_runtime/runtime/components/custom/website/content/ChecklistItem').then(m => m.ChecklistItem),
  'LinkCardFeatureProps': () => import('../app_runtime/runtime/components/custom/website/content/FeatureItem').then(m => m.FeatureItem),
  'MetricFeatureProps': () => import('../app_runtime/runtime/components/custom/website/content/FeatureItem').then(m => m.FeatureItem),
  'PricingPlanProps': () => import('../app_runtime/runtime/components/custom/website/content/PricingPlan').then(m => m.PricingPlan),
  'PricingTableProps': () => import('../app_runtime/runtime/components/custom/website/content/PricingTable').then(m => m.PricingTable),
  'SocialLinkProps': () => import('../app_runtime/runtime/components/custom/website/content/SocialLink').then(m => m.SocialLink),
  'TeamMemberProps': () => import('../app_runtime/runtime/components/custom/website/content/TeamMember').then(m => m.TeamMember),
  'TestimonialItemProps': () => import('../app_runtime/runtime/components/custom/website/content/TestimonialItem').then(m => m.TestimonialItem),
  'StatsCounterProps': () => import('../app_runtime/runtime/components/custom/website/content/StatsCounter').then(m => m.StatsCounter),
  'ComparisonTableProps': () => import('../app_runtime/runtime/components/custom/website/content/ComparisonTable').then(m => m.ComparisonTable),
  'DownloadButtonProps': () => import('../app_runtime/runtime/components/custom/website/content/DownloadButton').then(m => m.DownloadButton),
  'LogoItemProps': () => import('../app_runtime/runtime/components/custom/website/content/LogoItem').then(m => m.LogoItem),
  'CodeSnippetProps': () => import('../app_runtime/runtime/components/custom/website/content/CodeSnippet').then(m => m.CodeSnippet),
  'ProcessStepsBlockProps': () => import('../app_runtime/runtime/components/custom/website/content/ProcessStepsBlock').then(m => m.ProcessStepsBlock),
  'TimelineBlockProps': () => import('../app_runtime/runtime/components/custom/website/content/TimelineBlock').then(m => m.TimelineBlock),
  'QuoteBlockProps': () => import('../app_runtime/runtime/components/custom/website/content/QuoteBlock').then(m => m.QuoteBlock),
  'MarkdownBlockProps': () => import('../app_runtime/runtime/components/custom/website/content/MarkdownBlock').then(m => m.MarkdownBlock),

  // =================================================================
  // WEBSITE - BLOG COMPONENTS
  // =================================================================
  'BlogMainPage': () => import('../app_runtime/runtime/components/custom/website/blog/BlogMain').then(m => m.BlogMain),
  'BlogPostPage': () => import('../app_runtime/runtime/components/custom/website/blog/BlogPost').then(m => m.BlogPost),

  // =================================================================
  // WEBSITE - UTILS COMPONENTS
  // =================================================================
  'BackToTopProps': () => import('../app_runtime/runtime/components/custom/website/utils/BackToTop').then(m => m.BackToTop),
  'DateTimeDisplayProps': () => import('../app_runtime/runtime/components/custom/website/utils/DateTimeDisplay').then(m => m.DateTimeDisplay),
  'LazyLoadProps': () => import('../app_runtime/runtime/components/custom/website/utils/LazyLoad').then(m => m.LazyLoad),
  'SeoMetaProps': () => import('../app_runtime/runtime/components/custom/website/utils/SeoMeta').then(m => m.SeoMeta),
  'PortalProps': () => import('../app_runtime/runtime/components/custom/website/utils/Portal').then(m => m.Portal),
  'LanguageSelectorProps': () => import('../app_runtime/runtime/components/custom/website/utils/LanguageSelector').then(m => m.LanguageSelector),
  'ShareButtonProps': () => import('../app_runtime/runtime/components/custom/website/utils/ShareButton').then(m => m.ShareButton),
};

// Cache for loaded components
const componentCache = new Map<string, React.ComponentType<any>>();

/**
 * Get a component from the registry by componentType (async)
 * @param componentType - The component type string
 * @returns Promise that resolves to the React component or null if not found
 */
export const getComponent = async (componentType: string): Promise<React.ComponentType<any> | null> => {
  //console.log(`[Registry] Looking up component1: ${componentType}`);
  const componentLoader = componentRegistry[componentType];
  if (!componentLoader) {
    console.error(`[Registry] Component type "${componentType}" not found in registry`);
    console.log(`[Registry] Available components:`, Object.keys(componentRegistry).filter(key => key.includes('Feature')));
    return null;
  }

  //console.log(`[Registry] Component loader found for: ${componentType}`);
  
  try {
    // Load the component
    //console.log(`[Registry] Attempting to import: ${componentType}`);
    const module = await componentLoader();
    //console.log(`[Registry] Import completed for ${componentType}:`, module ? 'SUCCESS' : 'FAILED');

    if (!module) {
      console.error(`[Registry] Component loader returned null for: ${componentType}`);
      return null;
    }

    // Explicitly check if module is falsy first
    if (!module) {
      console.error(`[Registry] Component loader returned null or undefined for: ${componentType}`);
      return null;
    }

    // Cast module to any to avoid overly strict type checking issues with dynamic imports
    const anyModule = module as any;

    // Check for valid React component characteristics
    let isValidComponent = false;
    if (typeof anyModule === 'function') {
      isValidComponent = true; // Regular function/class component
    } else if (anyModule && typeof anyModule === 'object') {
      if (anyModule.$$typeof) { // React.memo, forwardRef (modern), lazy
        isValidComponent = true;
      } else if (anyModule._payload && (anyModule as any)._init) { // React.lazy specific check
         isValidComponent = true;
      } else if (typeof anyModule.render === 'function') { // Legacy forwardRef or class component instance
        isValidComponent = true;
      }
    }


    if (!isValidComponent) {
      console.error(`[Registry] Loaded module is not a valid React component for: ${componentType}`, {
        type: typeof anyModule,
        moduleContent: anyModule, // Avoid using 'module' as key if it's a reserved word in some contexts
        hasRender: typeof anyModule?.render === 'function',
        has$$typeof: !!anyModule?.$$typeof,
        hasPayload: !!anyModule?._payload
      });
      return null;
    }

    // Cache the loaded component
    componentCache.set(componentType, anyModule as React.ComponentType<any>);

    return anyModule as React.ComponentType<any>;
  } catch (error) {
    console.error(`[Registry] Failed to load component: ${componentType}`, error);
    return null;
  }
}

/**
 * Get a component from the registry synchronously (for cached components)
 * @param componentType - The component type string
 * @returns The React component or null if not found/cached
 */
export function getComponentSync(componentType: string): React.ComponentType<any> | null {
  return componentCache.get(componentType) || null;
}

/**
 * Preload a component into the cache
 * @param componentType - The component type string
 * @returns Promise that resolves when component is loaded
 */
export async function preloadComponent(componentType: string): Promise<void> {
  await getComponent(componentType);
}

/**
 * Preload multiple components into the cache
 * @param componentTypes - Array of component type strings
 * @returns Promise that resolves when all components are loaded
 */
export async function preloadComponents(componentTypes: string[]): Promise<void> {
  await Promise.all(componentTypes.map(type => preloadComponent(type)));
}

/**
 * Check if a component type is registered
 * @param componentType - The component type string
 * @returns True if the component is registered
 */
export function isComponentRegistered(componentType: string): boolean {
  return componentType in componentRegistry;
}

/**
 * Check if a component is already loaded in cache
 * @param componentType - The component type string
 * @returns True if the component is cached
 */
export function isComponentCached(componentType: string): boolean {
  return componentCache.has(componentType);
}

/**
 * Get all registered component types
 * @returns Array of all registered component type strings
 */
export function getRegisteredComponentTypes(): string[] {
  return Object.keys(componentRegistry);
}

/**
 * Clear the component cache
 */
export function clearComponentCache(): void {
  componentCache.clear();
}
