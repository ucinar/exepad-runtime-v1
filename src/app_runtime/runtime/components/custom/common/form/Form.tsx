// components/form/Form.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Button } from '@/runtime/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/runtime/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/runtime/components/ui/alert';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { FormProps, FormField, FieldSetProps } from '@/interfaces/components/common/forms/forms';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/runtime/hooks/use-toast';
import { executeServiceCall, handleSuccessAction } from '@/lib/service-call';

/**
 * A data-driven Form component that renders complete forms with validation and submission.
 * Supports single-column, two-column, and stepped (multi-page) layouts.
 */
export const Form: React.FC<FormProps> = ({
  title,
  description,
  layout = 'singleColumn',
  content = [],
  steps = [],
  actions,
  onSubmitAction,
  initialValues = {},
  classes,
  componentType,
  uuid,
  ...restProps
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ 
    type: 'success' | 'error' | 'warning' | null; 
    message: string;
    notificationType?: 'toast' | 'inline' | 'alert' | 'banner' | 'minimal' | 'none';
  } | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form fields to re-render on reset
  const { toast } = useToast();

  const isSteppedLayout = layout === 'stepped' && steps && steps.length > 0;
  const totalSteps = isSteppedLayout ? steps.length : 1;
  const currentFields = isSteppedLayout ? steps[currentStep]?.content : content;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null); // Clear previous messages

    try {
      // Extract form data from actual form elements
      const form = e.currentTarget;
      const formDataObj = new FormData(form);
      const submissionData: Record<string, any> = {};
      
      // Convert FormData to plain object
      formDataObj.forEach((value, key) => {
        // Handle multiple values for the same key (e.g., checkboxes)
        if (submissionData[key]) {
          if (Array.isArray(submissionData[key])) {
            submissionData[key].push(value);
          } else {
            submissionData[key] = [submissionData[key], value];
          }
        } else {
          submissionData[key] = value;
        }
      });
      
      console.log('[Form] Form data extracted:', submissionData);
      console.log('[Form] Form UUID:', uuid);

      // Execute secure service call using actionIdToAPIEndpointMap
      if (onSubmitAction) {
        console.log('[Form] Executing service call:', onSubmitAction.actionId);
        
        // Warn if uuid is missing for form tracking
        if (!uuid) {
          console.warn('[Form] UUID is undefined - form submissions may not be tracked properly');
        }
        
        const result = await executeServiceCall(onSubmitAction, submissionData, uuid);

        if (result.success) {
          // Show success notification - prioritize API response message
          const successMsg = result.data?.message || onSubmitAction.successMessage || 'Form submitted successfully';
          
          console.log('[Form] Success response data:', result.data);
          
          // Handle notification based on type
          switch (onSubmitAction.notificationType) {
            case 'toast':
              // Temporary popup only
              toast({
                title: '✓ Success',
                description: successMsg,
                variant: 'default',
              });
              break;
              
            case 'none':
              // Silent - no notification
              console.log('[Form] Silent success:', successMsg);
              break;
              
            default:
              // All other types show inline message
              setFormMessage({
                type: 'success',
                message: successMsg,
                notificationType: onSubmitAction.notificationType
              });
          }

          // Handle success action (redirect, clearForm, etc.)
          handleSuccessAction(onSubmitAction.onSuccessAction, () => handleReset(true));

        } else {
          // Show error notification - prioritize configured message for user display
          const errorMsg = onSubmitAction.errorMessage || result.data?.message || result.error || 'Form submission failed';
          
          console.log('[Form] Error response data:', result.data);
          console.error('[Form] API Error details:', result.error);
          
          // Errors always show inline (except 'none'), plus optional toast
          if (onSubmitAction.notificationType === 'toast') {
            // Toast: show both popup and compact inline
            toast({
              title: '✗ Error',
              description: errorMsg,
              variant: 'destructive',
            });
            setFormMessage({
              type: 'error',
              message: errorMsg,
              notificationType: 'inline'
            });
          } else if (onSubmitAction.notificationType === 'none') {
            // Silent - log only
            console.error('[Form] Silent error:', errorMsg);
          } else {
            // All other types: show inline with specified style
            setFormMessage({
              type: 'error',
              message: errorMsg,
              notificationType: onSubmitAction.notificationType
            });
          }
        }
      } else {
        // No onSubmitAction configured
        const warningMsg = 'No submission handler configured for this form';
        console.warn('[Form]', warningMsg);
        
        setFormMessage({
          type: 'warning',
          message: warningMsg
        });
        
        toast({
          title: '⚠ Warning',
          description: warningMsg,
          variant: 'default',
        });
      }
      
    } catch (error: any) {
      console.error('[Form] Submission error:', error);
      
      // Use configured error message for user display
      const errorMsg = onSubmitAction?.errorMessage || 'An unexpected error occurred';
      
      // Show error notification based on configured type
      if (onSubmitAction?.notificationType === 'toast') {
        toast({
          title: '✗ Error',
          description: errorMsg,
          variant: 'destructive',
        });
        setFormMessage({
          type: 'error',
          message: errorMsg,
          notificationType: 'inline'
        });
      } else if (onSubmitAction?.notificationType === 'none') {
        console.error('[Form] Silent exception:', errorMsg);
      } else {
        setFormMessage({
          type: 'error',
          message: errorMsg,
          notificationType: onSubmitAction?.notificationType || 'alert'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = (preserveMessage = false) => {
    setFormData(initialValues);
    setCurrentStep(0);
    if (!preserveMessage) {
      setFormMessage(null); // Clear any messages when resetting (unless preserving)
    }
    setFormKey(prev => prev + 1); // Force form fields to re-mount with fresh state
  };

  const renderActionButton = (action: any) => {
    const handleClick = () => {
      switch (action.actionType) {
        case 'submit':
          // Form submission is handled by the form onSubmit
          break;
        case 'reset':
          handleReset();
          break;
        case 'nextStep':
          handleNext();
          break;
        case 'prevStep':
          handlePrevious();
          break;
        case 'cancel':
          console.log('Cancel clicked');
          break;
        case 'custom':
          console.log('Custom action:', action.onClick);
          break;
      }
    };

    const isDisabled = 
      (action.actionType === 'submit' && isSubmitting) ||
      (action.actionType === 'nextStep' && currentStep >= totalSteps - 1) ||
      (action.actionType === 'prevStep' && currentStep === 0) ||
      action.disabled;

    // For stepped forms, show/hide certain buttons based on current step
    if (isSteppedLayout) {
      if (action.actionType === 'submit' && currentStep < totalSteps - 1) {
        return null; // Hide submit button until last step
      }
      if (action.actionType === 'nextStep' && currentStep >= totalSteps - 1) {
        return null; // Hide next button on last step
      }
      if (action.actionType === 'prevStep' && currentStep === 0) {
        return null; // Hide previous button on first step
      }
    }

    return (
      <Button
        key={action.text || action.actionType}
        type={action.actionType === 'submit' ? 'submit' : 'button'}
        variant={action.variant || 'default'}
        size={action.size || 'default'}
        disabled={isDisabled}
        onClick={action.actionType !== 'submit' ? handleClick : undefined}
        className={cn(action.classes)}
      >
        {action.actionType === 'submit' && isSubmitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {action.actionType === 'prevStep' && !isSubmitting && <ChevronLeft className="mr-2 h-4 w-4" />}
        {action.actionType === 'submit' 
          ? (isSubmitting ? 'Submitting...' : action.text)
          : action.text
        }
        {action.actionType === 'nextStep' && !isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    );
  };

  const renderFields = (fieldsList: (FormField | FieldSetProps)[]) => {
    const gridClasses = cn(
      'gap-6',
      layout === 'twoColumns' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-6'
    );

    return (
      <div className={gridClasses} key={formKey}>
        {fieldsList.map((field) => (
          <DynamicRenderer key={`${formKey}-${field.uuid}`} component={field} />
        ))}
      </div>
    );
  };

  return (
    <Card className={cn('w-full', classes)} {...filterDOMProps(restProps)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        
        {/* Stepper indicator for multi-step forms */}
        {isSteppedLayout && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {steps[currentStep]?.title}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          {/* Display form-level success/error/warning messages */}
          {formMessage && (
            <Alert 
              variant={formMessage.type === 'error' ? 'destructive' : 'default'} 
              className={cn(
                'mb-6',
                // Banner: Bold prominent with thick left border
                formMessage.notificationType === 'banner' && cn(
                  'border-l-4 py-4',
                  formMessage.type === 'success' && 'border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
                  formMessage.type === 'error' && 'border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
                  formMessage.type === 'warning' && 'border-yellow-600 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100'
                ),
                // Inline: Clean with subtle border and lighter background
                formMessage.notificationType === 'inline' && cn(
                  'border py-3',
                  formMessage.type === 'success' && 'border-green-200 bg-green-50/50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
                  formMessage.type === 'error' && 'border-red-200 bg-red-50/50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
                  formMessage.type === 'warning' && 'border-yellow-200 bg-yellow-50/50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                ),
                // Alert: Standard alert with rounded border and shadow
                formMessage.notificationType === 'alert' && cn(
                  'border-2 rounded-lg shadow-sm py-3.5',
                  formMessage.type === 'success' && 'border-green-400 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 dark:border-green-600',
                  formMessage.type === 'error' && 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 dark:border-red-600',
                  formMessage.type === 'warning' && 'border-yellow-400 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-600'
                ),
                // Minimal: Text only, no decoration
                formMessage.notificationType === 'minimal' && cn(
                  'border-0 bg-transparent shadow-none p-2',
                  formMessage.type === 'success' && 'text-green-700 dark:text-green-400',
                  formMessage.type === 'error' && 'text-red-700 dark:text-red-400',
                  formMessage.type === 'warning' && 'text-yellow-700 dark:text-yellow-400'
                )
              )}
            >
              {formMessage.notificationType !== 'minimal' && (
                <>
                  {formMessage.type === 'success' && <CheckCircle2 className={cn('h-4 w-4', formMessage.notificationType === 'banner' && 'h-5 w-5')} />}
                  {formMessage.type === 'error' && <XCircle className={cn('h-4 w-4', formMessage.notificationType === 'banner' && 'h-5 w-5')} />}
                  {formMessage.type === 'warning' && <AlertCircle className={cn('h-4 w-4', formMessage.notificationType === 'banner' && 'h-5 w-5')} />}
                </>
              )}
              <AlertTitle className={cn(
                formMessage.notificationType === 'banner' && 'font-bold text-base',
                formMessage.notificationType === 'inline' && 'font-medium text-sm',
                formMessage.notificationType === 'minimal' && 'sr-only'
              )}>
                {formMessage.type === 'success' && 'Success'}
                {formMessage.type === 'error' && 'Error'}
                {formMessage.type === 'warning' && 'Warning'}
              </AlertTitle>
              <AlertDescription className={cn(
                formMessage.notificationType === 'banner' && 'text-base',
                formMessage.notificationType === 'inline' && 'text-sm',
                formMessage.notificationType === 'minimal' && 'text-sm font-medium'
              )}>
                {formMessage.message}
              </AlertDescription>
            </Alert>
          )}
          
          {currentFields && renderFields(currentFields)}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            {actions
              .filter(action => ['cancel', 'reset', 'prevStep'].includes(action.actionType))
              .map(action => renderActionButton(action))}
          </div>
          <div className="flex gap-2">
            {actions
              .filter(action => ['nextStep', 'submit', 'custom'].includes(action.actionType))
              .map(action => renderActionButton(action))}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

Form.displayName = 'Form';

export default Form;

