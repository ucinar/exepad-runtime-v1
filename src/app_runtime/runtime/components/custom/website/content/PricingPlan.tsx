import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this path
import { ComponentProps } from '@/interfaces/components/common/core';

// Assuming shadcn/ui paths
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardFooter
} from "@/runtime/components/ui/card";
import { Check } from "lucide-react";

// Assuming interfaces are imported from their respective files in your project.
import { PricingPlanProps } from '@/interfaces/components/website/content/content';


/**
 * Renders a single pricing plan card as a Server Component.
 * It is purely presentational and delegates the rendering of its interactive
 * button to the DynamicRenderer.
 */
export const PricingPlan = ({
  name,
  price,
  period,
  features,
  description,
  highlight,
  button,
  classes,
}: PricingPlanProps) => {
  return (
    <Card className={cn(
      "flex flex-col h-full",
      highlight ? "border-primary ring-2 ring-primary shadow-lg" : "border-gray-200",
      classes
    )}>
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-semibold">
          <DynamicRenderer component={name as ComponentProps} />
        </CardTitle>
        {description && (
          <CardDescription className="mt-1">
            <DynamicRenderer component={description as ComponentProps} />
          </CardDescription>
        )}
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold tracking-tight">{typeof price === 'number' ? `$${price}` : price}</span>
          <span className="ml-1 text-sm font-semibold text-gray-500">/{period}</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-grow">
        <ul className="space-y-3 text-sm text-gray-600">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mr-2 mt-0.5" />
              <span className="prose prose-gray max-w-none dark:prose-invert prose-p:mb-0 prose-p:inline prose-strong:font-semibold">
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    p: ({ children }) => <>{children}</>,
                  }}
                >
                  {feature}
                </ReactMarkdown>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-6 mt-auto">
        {/* The button is a component configuration. The DynamicRenderer,
            which is a Client Component, will handle rendering it and attaching
            any necessary client-side event handlers. */}
        <div className="w-full">
            <DynamicRenderer component={button} />
        </div>
      </CardFooter>
    </Card>
  );
};
