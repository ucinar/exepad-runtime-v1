// components/form/QuizForm.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Button } from '@/runtime/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/runtime/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/runtime/components/ui/alert';
import { Progress } from '@/runtime/components/ui/progress';
import { Badge } from '@/runtime/components/ui/badge';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { QuizFormProps, FormField, FieldSetProps } from '@/interfaces/components/common/forms/forms';
import { Clock, Award, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/runtime/hooks/use-toast';
import { executeServiceCall, handleSuccessAction } from '@/lib/service-call';

/**
 * A specialized QuizForm component for quizzes, exams, and surveys.
 * Extends the Form component with scoring, time limits, and immediate feedback.
 */
export const QuizForm: React.FC<QuizFormProps> = ({
  title,
  description,
  layout = 'singleColumn',
  content = [],
  steps = [],
  actions,
  onSubmitAction,
  initialValues = {},
  passingScore = 70,
  showImmediateFeedback = false,
  timeLimitSeconds,
  classes,
  componentType,
  uuid,
  ...restProps
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds || null);
  const [timerActive, setTimerActive] = useState(!!timeLimitSeconds);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string } | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form fields to re-render on reset
  const { toast } = useToast();

  const isSteppedLayout = layout === 'stepped' && steps && steps.length > 0;
  const totalSteps = isSteppedLayout ? steps.length : 1;
  const currentFields = isSteppedLayout ? steps[currentStep]?.content : content;

  // Calculate total possible points
  const totalPoints = React.useMemo(() => {
    const allFields = isSteppedLayout 
      ? steps.flatMap(step => step.content)
      : content;
    
    return allFields.reduce((sum, field) => {
      if ('componentType' in field && field.componentType === 'QuizQuestionFieldProps' && 'points' in field) {
        return sum + (field.points || 0);
      }
      return sum;
    }, 0);
  }, [content, steps, isSteppedLayout]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeRemaining === null || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const handleTimeUp = () => {
    console.log('Time is up! Auto-submitting quiz...');
    // Auto-submit the quiz when time runs out
    handleSubmit(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    // This is a placeholder implementation
    // In a real app, you'd check answers against correct answers
    const earnedPoints = Math.floor(Math.random() * totalPoints); // Mock calculation
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    return { earnedPoints, percentage };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | null) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setTimerActive(false);
    setFormMessage(null); // Clear previous messages

    try {
      const { earnedPoints, percentage } = calculateScore();
      setScore(percentage);
      setIsCompleted(true);

      const quizResults = {
        ...formData,
        score: percentage,
        earnedPoints,
        totalPoints,
        passed: percentage >= passingScore,
        timeTaken: timeLimitSeconds ? (timeLimitSeconds - (timeRemaining || 0)) : null
      };

      console.log('[QuizForm] Quiz completed:', quizResults);

      // Execute secure service call using actionIdToAPIEndpointMap
      if (onSubmitAction) {
        console.log('[QuizForm] Executing service call:', onSubmitAction.actionId);
        
        const result = await executeServiceCall(onSubmitAction, quizResults, uuid);

        if (result.success) {
          // Show success notification based on notificationType
          const isPassed = percentage >= passingScore;
          const successMsg = onSubmitAction.successMessage || 
            (isPassed ? 'Congratulations! You passed!' : 'Quiz submitted successfully');
          
          // Set inline form message for banner and other types
          if (onSubmitAction.notificationType === 'banner' || onSubmitAction.notificationType === 'alert' || onSubmitAction.notificationType === 'inline') {
            setFormMessage({
              type: 'success',
              message: successMsg
            });
          }
          
          // Also show toast notification
          toast({
            title: isPassed ? '🎉 Quiz Passed!' : '✓ Quiz Completed',
            description: successMsg,
            variant: 'default',
          });

          // Note: Don't auto-redirect or clear form for quiz results
          // User needs to see their score first
          
        } else {
          // Show error notification - prioritize custom message from config
          const errorMsg = onSubmitAction.errorMessage || result.error || 'Quiz submission failed';
          
          // Set inline error message
          setFormMessage({
            type: 'error',
            message: errorMsg
          });
          
          // Also show toast notification
          toast({
            title: '✗ Error',
            description: errorMsg,
            variant: 'destructive',
          });
          
          // Log the actual API error for debugging
          if (result.error && result.error !== errorMsg) {
            console.error('[QuizForm] API Error details:', result.error);
          }
        }
      } else {
        // No onSubmitAction configured
        const warningMsg = 'No submission handler configured for this quiz';
        console.warn('[QuizForm]', warningMsg);
        
        setFormMessage({
          type: 'warning',
          message: warningMsg
        });
      }
      
    } catch (error: any) {
      console.error('[QuizForm] Submission error:', error);
      const errorMsg = error.message || 'An unexpected error occurred';
      
      // Set inline error message
      setFormMessage({
        type: 'error',
        message: errorMsg
      });
      
      // Show toast notification
      toast({
        title: '✗ Error',
        description: errorMsg,
        variant: 'destructive',
      });
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

  const handleReset = () => {
    setFormData(initialValues);
    setCurrentStep(0);
    setIsCompleted(false);
    setScore(null);
    setTimeRemaining(timeLimitSeconds || null);
    setFormMessage(null); // Clear any messages when resetting
    setTimerActive(!!timeLimitSeconds);
    setFormKey(prev => prev + 1); // Force form fields to re-mount with fresh state
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

  const renderResults = () => {
    if (!isCompleted || score === null) return null;

    const passed = score >= passingScore;

    return (
      <div className={cn(
        'p-6 rounded-lg border-2',
        passed 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {passed ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <h3 className="text-xl font-bold">
                {passed ? 'Congratulations!' : 'Keep Trying!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {passed ? 'You passed the quiz!' : 'You did not meet the passing score.'}
              </p>
            </div>
          </div>
          <Badge variant={passed ? 'default' : 'destructive'} className="text-2xl py-2 px-4">
            {score.toFixed(0)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Your Score:</span>
            <span className="font-semibold">{score.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Passing Score:</span>
            <span className="font-semibold">{passingScore}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  };

  return (
    <Card className={cn('w-full', classes)} {...filterDOMProps(restProps)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex flex-col items-end gap-2">
            {totalPoints > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {totalPoints} points
              </Badge>
            )}
            {timeLimitSeconds && !isCompleted && (
              <Badge 
                variant={timeRemaining && timeRemaining < 60 ? 'destructive' : 'default'}
                className="flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(timeLimitSeconds)}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Stepper indicator for multi-step quizzes */}
        {isSteppedLayout && !isCompleted && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {steps[currentStep]?.title}
              </span>
            </div>
            <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>

      {isCompleted ? (
        <CardContent>
          {renderResults()}
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent>
            {/* Display form-level success/error/warning messages */}
            {formMessage && (
              <Alert 
                variant={formMessage.type === 'error' ? 'destructive' : 'default'} 
                className={cn(
                  'mb-6',
                  formMessage.type === 'success' && 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
                  formMessage.type === 'warning' && 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100'
                )}
              >
                {formMessage.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {formMessage.type === 'error' && <XCircle className="h-4 w-4" />}
                {formMessage.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {formMessage.type === 'success' && 'Success'}
                  {formMessage.type === 'error' && 'Error'}
                  {formMessage.type === 'warning' && 'Warning'}
                </AlertTitle>
                <AlertDescription>
                  {formMessage.message}
                </AlertDescription>
              </Alert>
            )}
            
            {currentFields && renderFields(currentFields)}
          </CardContent>

          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && isSteppedLayout && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep < totalSteps - 1 && isSteppedLayout ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

QuizForm.displayName = 'QuizForm';

export default QuizForm;

