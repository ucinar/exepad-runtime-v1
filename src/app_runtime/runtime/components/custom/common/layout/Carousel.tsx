"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/runtime/components/ui/carousel"; // Assuming shadcn/ui component paths
import Autoplay from "embla-carousel-autoplay";
import { CarouselProps } from "@/interfaces/components/common/layout/layout";
import { DynamicRenderer } from '@/components/DynamicRenderer';

/**
 * A generic, data-driven carousel component for displaying a slidable
 * collection of any other components.
 */
export const CarouselComponent = ({
  content,
  autoplay = false,
  interval = 5000,
  loop = true,
  showControls = true,
  showIndicators = true,
  slidesPerView = 1,
}: CarouselProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Set up the autoplay plugin
  const plugins = React.useRef([
    Autoplay({
      delay: interval,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }),
  ]);

  // Effect to handle API setup and event listeners
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", onSelect);

    // Clean up the event listener
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Effect to control the autoplay plugin
  React.useEffect(() => {
    if (!api) return;
    if (autoplay) {
      api.plugins().autoplay?.play();
    } else {
      api.plugins().autoplay?.stop();
    }
  }, [api, autoplay]);

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
  };

  // Calculate the basis for Tailwind CSS dynamically
  const basisClass = `md:basis-1/${slidesPerView}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-12">
      <Carousel
        setApi={setApi}
        plugins={autoplay ? plugins.current : []}
        opts={{
          align: "start",
          loop: loop,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {content.map((childComponent) => (
            <CarouselItem
              key={childComponent.uuid}
              className={`pl-4 ${basisClass}`}
            >
              <DynamicRenderer component={childComponent} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls && (
          <>
            <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>

      {showIndicators && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index + 1 === current ? "w-4 bg-primary" : "bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
