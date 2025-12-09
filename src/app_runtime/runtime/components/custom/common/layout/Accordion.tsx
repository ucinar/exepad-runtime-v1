"use client";

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names

// Assuming shadcn/ui paths
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/runtime/components/ui/accordion";

// Assuming interfaces are in this path, adjust as needed
import { 
    AccordionProps, 
    AccordionItemProps, 
} from '@/interfaces/components/common/layout/layout';
import DynamicRenderer, { DynamicRendererList } from '@/components/DynamicRenderer';


/**
 * A generic, data-driven layout component that displays a vertically
 * stacked list of interactive, collapsible panels.
 */
export const AccordionComponent = ({
    content,
    type = 'single',
    defaultValue,
    collapsible = false,
    style = 'default',
    classes, // from ComponentProps
  }: AccordionProps) => {
  
    // The 'flush' style removes the borders between items for a cleaner look.
    const styleClasses = {
      flush: "[&_[data-state=closed]]:border-b-0",
    };
    
    const commonClassName = cn(style === 'flush' && styleClasses.flush, classes);
  
    // Common content to avoid repetition
    const accordionItems = content.map((item) => (
      <AccordionItem 
        key={item.uuid} 
        value={item.uuid}
      >
        <AccordionTrigger>
          {/* The trigger can contain one or more components */}
          <DynamicRendererList components={item.trigger} />
        </AccordionTrigger>
        <AccordionContent>
          {/* The content panel can also contain multiple components */}
          <DynamicRendererList components={item.content} />
        </AccordionContent>
      </AccordionItem>
    ));
  
    // By handling the 'type' prop conditionally, we ensure TypeScript can
    // correctly infer the props for either AccordionSingleProps or AccordionMultipleProps,
    // resolving the type incompatibility error.
    if (type === 'multiple') {
      return (
          <Accordion
              type="multiple"
              defaultValue={defaultValue as string[] | undefined}
              className={commonClassName}
          >
              {accordionItems}
          </Accordion>
      );
    }
  
    return (
      <Accordion
          type="single"
          defaultValue={defaultValue as string | undefined}
          collapsible={collapsible}
          className={commonClassName}
      >
          {accordionItems}
      </Accordion>
    );
  };