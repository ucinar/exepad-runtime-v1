import * as React from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

// Assuming shadcn/ui paths
import { Card, CardContent } from "@/runtime/components/ui/card";
import { ArrowUp, ArrowDown, CheckCircle2, XCircle } from "lucide-react";

// Assuming interfaces are in this path, adjust as needed
import { 
    FeatureItemProps,
    StandardFeatureProps,
    ChecklistFeatureProps,
    LinkCardFeatureProps,
    MetricFeatureProps,
} from '@/interfaces/components/website/content/feature_item';
import { IconProps, ComponentProps } from '@/interfaces/components/common/core';
import { cn } from '@/lib/utils';
import { DynamicRenderer } from '@/components/DynamicRenderer';


// --- Helper & Placeholder Components ---


/**
 * A helper to render the trend indicator for the Metric feature.
 */
const TrendIndicator = ({ trend }: Pick<MetricFeatureProps, 'trend'>) => {
    if (!trend) return null;
    
    const color = trend.direction === 'up' 
        ? 'text-green-600' 
        : trend.direction === 'down' 
        ? 'text-red-600' 
        : 'text-gray-600';
        
    const Icon = trend.direction === 'up' 
        ? ArrowUp 
        : trend.direction === 'down' 
        ? ArrowDown 
        : null;

    return (
        <div className={`flex items-center text-sm font-medium ${color}`}>
            {Icon && <Icon className="w-4 h-4 mr-1" />}
            <span>{trend.value}</span>
        </div>
    );
};


// --- Main Component ---

/**
 * Renders a feature item. It acts as a dispatcher, selecting the correct
 * sub-component based on the `variant` property.
 */
export const FeatureItem = (props: FeatureItemProps) => {
    switch (props.variant) {
        case 'standard':
            return <StandardFeature {...props} />;
        case 'checklist':
            return <ChecklistFeature {...props} />;
        case 'linkCard':
            return <LinkCardFeature {...props} />;
        case 'metric':
            return <MetricFeature {...props} />;
        default:
            // Ensures compile-time check for all variants
            const _exhaustiveCheck: never = props;
            return null;
    }
};


// --- Variant Implementations ---

/**
 * Renders a standard feature with an icon, title, and text.
 * It supports multiple internal layouts and styles.
 */
const StandardFeature = ({ 
    layout, // Remove default here to handle logic inside
    style = 'default', 
    icon, 
    title, 
    text, 
    link,
    classes
}: Omit<StandardFeatureProps, 'variant'>) => {
    
    // Smart default: Cards in grids usually look best with icon on top to maximize width.
    // If style is 'card' and no layout specified, default to 'iconTopLeft'.
    const effectiveLayout = layout || (style === 'card' ? 'iconTopLeft' : 'iconLeft');

    const layoutClasses = {
        container: `flex ${
            effectiveLayout === 'iconTopCenter' ? 'flex-col items-center text-center gap-4' :
            effectiveLayout === 'iconTopLeft' ? 'flex-col items-start text-left gap-4' :
            effectiveLayout === 'iconRight' ? 'flex-row-reverse items-start text-right gap-4' :
            'flex-row items-start text-left gap-4' // icon-left
        }`,
        content: 'flex flex-col gap-2 w-full', // Added w-full
        iconWrapper: effectiveLayout === 'iconTopCenter' || effectiveLayout === 'iconTopLeft' 
            ? 'flex' 
            : 'flex-shrink-0 pt-1' // Added pt-1 for better optical alignment with text
    };

    const content = (
        <div className={cn(layoutClasses.container, classes)}>
            {icon && (
                <div className={layoutClasses.iconWrapper}>
                    <DynamicRenderer component={icon as ComponentProps} />
                </div>
            )}
            <div className={layoutClasses.content}>
                <DynamicRenderer 
                    component={{ 
                        ...title, 
                        classes: cn(
                            "font-bold leading-tight",
                            // Responsive sizing
                            style === 'card' ? "text-lg sm:text-xl" : "text-lg",
                            title.classes
                        ) 
                    } as ComponentProps} 
                />
                <div className={cn(
                    "text-sm sm:text-base leading-relaxed",
                    style === 'card' ? "text-gray-600 dark:text-gray-300" : "text-gray-700"
                )}>
                    <DynamicRenderer component={text as ComponentProps} />
                </div>
                {link && (
                    <Link
                        href={link.href}
                        className={cn("mt-2 text-sm font-semibold hover:underline inline-flex items-center", link.classes)}
                    >
                        {link.text}
                    </Link>
                )}
            </div>
        </div>
    );

    if (style === 'card' || style === 'bordered') {
        return (
            <Card className={cn(
                "h-full",
                style === 'bordered' ? 'border-gray-300 shadow-sm' : '',
                "hover:shadow-lg transition-shadow duration-300"
            )}>
                <CardContent className="p-5 sm:p-6 h-full flex flex-col">{content}</CardContent>
            </Card>
        );
    }

    return <div className="p-2">{content}</div>;
};

/**
 * Renders a feature as a checklist of items.
 */
const ChecklistFeature = ({ 
    icon, 
    title, 
    text, 
    content,
    classes
}: Omit<ChecklistFeatureProps, 'variant'>) => (
    <Card className={cn("h-full", classes)}>
        <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
                {icon && <DynamicRenderer component={icon as ComponentProps} />}
                <DynamicRenderer component={{ ...title, classes: cn("text-xl font-bold", title.classes) } as ComponentProps} />
            </div>
            {text && (
                <div className="text-gray-600 mb-4">
                    <DynamicRenderer component={text as ComponentProps} />
                </div>
            )}
            <ul className="space-y-3">
                {content.map(item => (
                    <li key={item.uuid} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            {item.checked ?? true ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <span className="text-gray-700">
                            <DynamicRenderer component={item.text as ComponentProps} />
                        </span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

/**
 * Renders a feature as a clickable link card with a colored accent.
 */
const LinkCardFeature = ({ 
    href, 
    eyebrowText, 
    title, 
    color,
    classes
}: Omit<LinkCardFeatureProps, 'variant'>) => (
    <Link href={href} className={cn("block h-full", classes)}>
        <Card className="h-full hover:border-blue-500 hover:bg-gray-50 transition-all duration-200 group">
            <div className="flex h-full">
                <div style={{ backgroundColor: color }} className="w-2 flex-shrink-0 rounded-l-lg"></div>
                <CardContent className="p-6">
                    <div className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        <DynamicRenderer component={eyebrowText as ComponentProps} />
                    </div>
                    <div className="mt-1 text-gray-900 group-hover:text-blue-600">
                        <DynamicRenderer component={{ ...title, classes: cn("text-lg font-bold", title.classes) } as ComponentProps} />
                    </div>
                </CardContent>
            </div>
        </Card>
    </Link>
);

/**
 * Renders a feature as a metric or KPI block.
 */
const MetricFeature = (props: Omit<MetricFeatureProps, 'variant'>) => {
    const { label, value, unit, icon, trend, classes } = props;
    
    // If custom classes are provided, use them as a standalone component
    // Otherwise, use the Card wrapper for default styling
    if (classes && classes.trim() !== '') {
        return (
            <div className={cn("h-full", classes)}>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium opacity-70">
                        <DynamicRenderer component={label as ComponentProps} />
                    </div>
                    {icon && <DynamicRenderer component={icon as ComponentProps} />}
                </div>
                <div className="mb-2">
                    <span className="text-3xl font-bold">{value}</span>
                    {unit && <span className="text-2xl opacity-70 ml-1">{unit}</span>}
                </div>
                {trend && (
                    <div>
                        <TrendIndicator trend={trend} />
                    </div>
                )}
            </div>
        );
    }

    // Default Card styling when no custom classes
    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                        <DynamicRenderer component={label as ComponentProps} />
                    </div>
                    {icon && <DynamicRenderer component={icon as ComponentProps} />}
                </div>
                <div className="mt-2">
                    <span className="text-3xl font-bold">{value}</span>
                    {unit && <span className="text-2xl text-muted-foreground ml-1">{unit}</span>}
                </div>
                <div className="mt-2">
                    <TrendIndicator trend={trend} />
                </div>
            </CardContent>
        </Card>
    );
};
