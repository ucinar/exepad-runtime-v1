import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/runtime/components/ui/avatar"; // Assuming shadcn/ui paths
import { Card, CardContent } from "@/runtime/components/ui/card";
import { Star } from "lucide-react"; // Using lucide-react for icons
import { TestimonialItemProps } from '@/interfaces/components/website/content/testimonials';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { ComponentProps } from '@/interfaces/components/common/core';

// A helper component to render the star rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

// A helper component for the author details, used by Card and Inline styles
const AuthorInfo = ({ author, authorTitle, avatar }: Pick<TestimonialItemProps, 'author' | 'authorTitle' | 'avatar'>) => (
    <div className="flex items-center gap-3 mt-4">
        <Avatar>
            <AvatarImage src={avatar?.src} alt={avatar?.alt || ''} />
            <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div>
            <div className="font-semibold text-sm text-gray-900">
                <DynamicRenderer component={author as ComponentProps} />
            </div>
            {authorTitle && (
                <div className="text-sm text-gray-500">
                    <DynamicRenderer component={authorTitle as ComponentProps} />
                </div>
            )}
        </div>
    </div>
);


/**
 * The implementation of the TestimonialItem component.
 * It dynamically changes its appearance based on the `style` prop.
 */
export const TestimonialItem = ({
  style = 'card',
  ...props
}: TestimonialItemProps) => {
  switch (style) {
    case 'quote':
      return <TestimonialQuote {...props} />;
    case 'inline':
      return <TestimonialInline {...props} />;
    case 'card':
    default:
      return <TestimonialCard {...props} />;
  }
};

// --- Style Implementations ---

const TestimonialCard = (props: Omit<TestimonialItemProps, 'style'>) => (
  <Card className="h-full">
    <CardContent className="p-6 flex flex-col justify-between h-full">
      <div>
        {props.rating && <StarRating rating={props.rating} />}
        {props.title && (
          <div className="mt-2">
            <DynamicRenderer component={{ ...props.title, classes: cn("font-bold text-lg", props.title.classes) } as ComponentProps} />
          </div>
        )}
        <div className="text-gray-600 mt-2 text-base leading-relaxed">
          "<DynamicRenderer component={props.text as ComponentProps} />"
        </div>
      </div>
      <AuthorInfo {...props} />
    </CardContent>
  </Card>
);

const TestimonialQuote = (props: Omit<TestimonialItemProps, 'style'>) => (
  <div className="text-center">
    <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>
    {props.title && (
      <div className="mb-2">
        <DynamicRenderer component={{ ...props.title, classes: cn("text-xl font-bold", props.title.classes) } as ComponentProps} />
      </div>
    )}
    <div className="text-lg italic text-gray-700">
      "<DynamicRenderer component={props.text as ComponentProps} />"
    </div>
    
    {/* --- FIX --- */}
    {/* The AuthorInfo helper is for a row layout. For this centered, vertical layout, we define the structure directly. */}
    <div className="mt-6">
        <Avatar className="mx-auto mb-2 h-12 w-12">
            <AvatarImage src={props.avatar?.src} alt={props.avatar?.alt || ''} />
            <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="font-semibold text-base text-gray-900">
          <DynamicRenderer component={props.author as ComponentProps} />
        </div>
        {props.authorTitle && (
          <div className="text-sm text-gray-500">
            <DynamicRenderer component={props.authorTitle as ComponentProps} />
          </div>
        )}
    </div>
  </div>
);

const TestimonialInline = (props: Omit<TestimonialItemProps, 'style'>) => (
    <div>
        {props.rating && <StarRating rating={props.rating} />}
        {props.title && (
          <div className="mt-2">
            <DynamicRenderer component={{ ...props.title, classes: cn("font-bold text-lg", props.title.classes) } as ComponentProps} />
          </div>
        )}
        <div className="text-gray-600 mt-2">
          "<DynamicRenderer component={props.text as ComponentProps} />"
        </div>
        <AuthorInfo {...props} />
    </div>
);
