// components/form/QuizQuestionField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/runtime/components/ui/radio-group';
import { Checkbox } from '@/runtime/components/ui/checkbox';
import { Input } from '@/runtime/components/ui/input';
import { Badge } from '@/runtime/components/ui/badge';
import { QuizQuestionFieldProps } from '@/interfaces/components/common/forms/forms';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * A data-driven QuizQuestionField component for quiz/exam questions.
 */
export const QuizQuestionField: React.FC<QuizQuestionFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = true,
  disabled = false,
  questionType,
  options = [],
  points,
  explanation,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const [answer, setAnswer] = useState<string | string[]>(
    questionType === 'checkboxes' ? [] : ''
  );
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const checkAnswer = () => {
    if (questionType === 'multipleChoice' || questionType === 'trueFalse') {
      const selectedOption = options.find(opt => String(opt.isCorrect) === answer);
      return selectedOption?.isCorrect || false;
    } else if (questionType === 'checkboxes') {
      const correctAnswers = options.filter(opt => opt.isCorrect).map(opt => opt.text);
      const selectedAnswers = answer as string[];
      return correctAnswers.length === selectedAnswers.length &&
        correctAnswers.every(ans => selectedAnswers.includes(ans));
    }
    return false;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowExplanation(true);
  };

  const isCorrect = submitted ? checkAnswer() : null;

  const renderMultipleChoice = () => (
    <RadioGroup
      value={answer as string}
      onValueChange={setAnswer}
      disabled={disabled || submitted}
    >
      {options.map((option, index) => {
        const optionId = `${name}-${index}`;
        const showFeedback = submitted && answer === String(index);
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                id={optionId}
                value={String(index)}
                className={cn(
                  showFeedback && (option.isCorrect ? 'border-green-500' : 'border-red-500')
                )}
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  'cursor-pointer font-normal flex-1',
                  (disabled || submitted) && 'cursor-default',
                  submitted && option.isCorrect && 'text-green-600 font-medium'
                )}
              >
                {option.text}
                {submitted && option.isCorrect && (
                  <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />
                )}
              </Label>
            </div>
            {showFeedback && option.feedback && (
              <p className="text-sm text-muted-foreground ml-6">{option.feedback}</p>
            )}
          </div>
        );
      })}
    </RadioGroup>
  );

  const renderCheckboxes = () => (
    <div className="space-y-2">
      {options.map((option, index) => {
        const optionId = `${name}-${index}`;
        const isChecked = (answer as string[]).includes(option.text);
        const showFeedback = submitted && isChecked;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={optionId}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (disabled || submitted) return;
                  const newAnswer = checked
                    ? [...(answer as string[]), option.text]
                    : (answer as string[]).filter(a => a !== option.text);
                  setAnswer(newAnswer);
                }}
                disabled={disabled || submitted}
                className={cn(
                  showFeedback && (option.isCorrect ? 'border-green-500' : 'border-red-500')
                )}
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  'cursor-pointer font-normal flex-1',
                  (disabled || submitted) && 'cursor-default',
                  submitted && option.isCorrect && 'text-green-600 font-medium'
                )}
              >
                {option.text}
                {submitted && option.isCorrect && (
                  <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />
                )}
              </Label>
            </div>
            {showFeedback && option.feedback && (
              <p className="text-sm text-muted-foreground ml-6">{option.feedback}</p>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderShortAnswer = () => (
    <Input
      type="text"
      value={answer as string}
      onChange={(e) => setAnswer(e.target.value)}
      disabled={disabled || submitted}
      placeholder="Type your answer..."
      className={cn(
        submitted && 'bg-muted'
      )}
    />
  );

  return (
    <div className={cn('space-y-4 p-4 border rounded-lg', classes)} {...filterDOMProps(restProps)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Label className="text-base font-semibold">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {helperText && (
            <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
          )}
        </div>
        <Badge variant="secondary">{points} {points === 1 ? 'point' : 'points'}</Badge>
      </div>

      <div className="space-y-3">
        {questionType === 'multipleChoice' && renderMultipleChoice()}
        {questionType === 'trueFalse' && renderMultipleChoice()}
        {questionType === 'checkboxes' && renderCheckboxes()}
        {questionType === 'shortAnswer' && renderShortAnswer()}
      </div>

      {submitted && isCorrect !== null && (
        <div className={cn(
          'flex items-center space-x-2 p-3 rounded-md',
          isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {isCorrect ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Correct!</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Incorrect</span>
            </>
          )}
        </div>
      )}

      {showExplanation && explanation && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">Explanation:</p>
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
      )}
    </div>
  );
};

QuizQuestionField.displayName = 'QuizQuestionField';

export default QuizQuestionField;

