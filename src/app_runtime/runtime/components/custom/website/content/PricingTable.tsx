import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this path

// Assuming shadcn/ui paths
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardFooter
} from "@/runtime/components/ui/card";
import { Label } from "@/runtime/components/ui/label";
import { Switch } from "@/runtime/components/ui/switch";
import { Badge } from "@/runtime/components/ui/badge";
import { Check } from "lucide-react";

// Assuming interfaces are imported from their respective files in your project.
import { PricingTableProps, PricingPlanProps } from '@/interfaces/components/website/content/content';


// --- Sub-Component for Billing Toggle (Client Component) ---

const BillingToggle = () => {
    "use client";
    const [isYearly, setIsYearly] = React.useState(false);

    return (
        <div className="flex items-center justify-center space-x-3">
            <Label htmlFor="billing-toggle" className={cn(!isYearly ? "text-primary" : "text-muted-foreground")}>
                Monthly
            </Label>
            <Switch 
                id="billing-toggle" 
                checked={isYearly}
                onCheckedChange={setIsYearly}
                aria-label="Toggle billing period"
            />
            <Label htmlFor="billing-toggle" className={cn(isYearly ? "text-primary" : "text-muted-foreground")}>
                Annually
            </Label>
            <Badge variant="secondary">SAVE 20%</Badge>
        </div>
    );
};


// --- Adjusted PricingPlan Component (Now accepts currency) ---

/**
 * Renders a single pricing plan card as a Server Component.
 * It is purely presentational and delegates the rendering of its interactive
 * button to the DynamicRenderer.
 */
const PricingPlan = ({
  name,
  price,
  period,
  features,
  description,
  highlight,
  button,
  currency = "$", // Default currency is $
  classes,
}: PricingPlanProps & { currency?: string }) => {
  return (
    <Card className={cn(
      "flex flex-col h-full",
      highlight ? "border-primary ring-2 ring-primary shadow-lg" : "border-gray-200",
      classes
    )}>
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-semibold"><DynamicRenderer component={name} /></CardTitle>
        {description && <CardDescription className="mt-1"><DynamicRenderer component={description} /></CardDescription>}
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold tracking-tight">{currency}{price}</span>
          <span className="ml-1 text-sm font-semibold text-gray-500">/{period}</span>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <ul className="space-y-3 text-sm text-gray-600">
          {Array.isArray(features) && features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mr-2 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 mt-auto">
        <div className="w-full">
            {button && <DynamicRenderer component={button} />}
        </div>
      </CardFooter>
    </Card>
  );
};


// --- Main PricingTable Component Implementation ---

/**
 * Renders a comparison table of pricing plans, with an optional toggle
 * for billing periods.
 */
export const PricingTable = ({
  content: plans,
  currency,
  showToggle,
  classes,
}: PricingTableProps) => {

  // --- FIX ---
  // Tailwind CSS's JIT compiler cannot parse dynamically constructed class names.
  // We must use full, static class names. This switch statement ensures the
  // correct responsive grid class is applied based on the number of plans,
  // preserving the intended responsive behavior.
  let gridColsClass = 'grid-cols-1';
  if (Array.isArray(plans)) {
      switch (plans.length) {
        case 2:
          gridColsClass = 'grid-cols-1 md:grid-cols-2';
          break;
        case 3:
          // This ensures Tailwind sees the full `lg:grid-cols-3` class.
          gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
          break;
        case 4:
          gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
          break;
        default:
          // A sensible fallback for 1 or more than 4 plans.
          gridColsClass = 'grid-cols-1 md:grid-cols-3';
      }
  }

  return (
    <div className={cn("space-y-8", classes)}>
      {showToggle && <BillingToggle />}
      
      <div className={cn(
        "grid gap-8 items-stretch",
        gridColsClass // Use the statically selected class name
      )}>
        {Array.isArray(plans) && plans.map((plan) => (
          <PricingPlan key={plan.uuid} {...plan} currency={currency} />
        ))}
      </div>
    </div>
  );
};
