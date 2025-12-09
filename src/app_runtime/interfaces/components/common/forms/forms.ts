// src/interfaces/forms.ts

import { ServiceCallProps } from '@/interfaces/services/service_call';
import { ComponentProps, ButtonProps, IconProps } from '../core';

// --- Core & Helper Types ---

/** Defines the visual arrangement for fields in a form, like a single column, two columns, or a multi-page "stepped" wizard. */
export type FormLayout = 'singleColumn' | 'twoColumns' | 'stepped';

/** Represents a single, selectable choice within a component like a dropdown, radio group, or checkbox group. */
export interface FormOption {
  /** The human-readable text displayed to the user for this option (e.g., "United States"). */
  label: string;
  /** The actual value that is stored and submitted when this option is selected (e.g., "US"). */
  value: string | number;
  /** If true, this specific option will be visible but not selectable by the user. */
  disabled?: boolean;
}

/** Defines a single validation constraint to be applied to a form field's value. */
export interface ValidationRule {
  /** The type of validation to perform, like checking for a required field or matching a pattern. */
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'min' | 'max' | 'custom';
  /** The value to validate against, such as a number for minLength or a regex string for a pattern. */
  value?: string | number | boolean;
  /** The user-friendly error message to display if this validation rule fails. */
  errorMessage: string;
  /** For 'custom' validation, this identifies a pre-registered custom validation function. */
  customValidatorId?: string;
}

/** Defines an action button within a form, such as 'Submit' or 'Reset'. */
export interface FormAction extends ButtonProps {
  /** The primary role of the button, which dictates its default behavior (e.g., submitting the form or moving to the next step). */
  actionType: 'submit' | 'reset' | 'cancel' | 'nextStep' | 'prevStep' | 'custom';
}

// --- Base & Structural Interfaces ---

/** Defines a set of common properties that are shared by almost every form field component. */
export interface BaseFieldProps extends ComponentProps {
  /** The unique identifier for the field, used as the key in the final form data object. */
  name: string;
  /** The human-readable label displayed alongside the form field (e.g., "First Name"). */
  label: string;
  /** Placeholder text that appears inside the input field when it is empty. */
  placeholder?: string;
  /** Additional text displayed below the field to provide more context or guidance. */
  helperText?: string;
  /** The initial value of the field when the form is first rendered. Can be a primitive value, date, or array depending on the field type. */
  defaultValue?: string | number | boolean | string[] | number[];
  /** If true, the user must provide a value for this field before the form can be submitted. */
  required?: boolean;
  /** If true, the field is rendered in a disabled state and cannot be interacted with. */
  disabled?: boolean;
  /** If true, the field's value is displayed but cannot be edited by the user. */
  readOnly?: boolean;
  /** An array of validation rules to be applied to this field's value. */
  validationRules?: ValidationRule[];
  /** A string expression that determines if the field is visible based on other form values. Example: "status === 'employed'" */
  visibilityCondition?: string;
}

/** A structural component that groups a set of related form fields under a common heading. */
export interface FieldSetProps extends ComponentProps {
    /** The title or heading for the group of fields (e.g., "Shipping Address"). */
    legend: string;
    /** An array of form fields to be rendered inside this fieldset. */
    content: FormField[];
}


// --- Standard Input Fields ---

/** Renders a standard single-line text input field for data like names, emails, or passwords. */
export interface TextFieldProps extends BaseFieldProps {
  /** The semantic type of the input, which can trigger specific browser UI or validation. */
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  /** The minimum number of characters required for the input. */
  minLength?: number;
  /** The maximum number of characters allowed in the input. */
  maxLength?: number;
}

/** Renders a multi-line text input field, suitable for longer text content like comments or descriptions. */
export interface TextAreaFieldProps extends BaseFieldProps {
  /** The initial number of visible text lines for the text area. */
  rows?: number;
  /** The minimum number of characters required for the text area. */
  minLength?: number;
  /** The maximum number of characters allowed in the text area. */
  maxLength?: number;
}

// --- Choice & Selection Fields ---

/** Renders a dropdown list (select box) that allows users to choose one or more options from a predefined list. */
export interface SelectFieldProps extends BaseFieldProps {
  /** An array of options that populate the dropdown list. */
  options: FormOption[];
  /** If true, the user can select multiple options from the list. */
  isMulti?: boolean;
}

/** 
 * Renders a single checkbox, typically used for binary (true/false) choices.
 * This interface extends BaseFieldProps without additional properties,
 * serving as a distinct type in the FormField discriminated union.
 */
export interface CheckboxFieldProps extends BaseFieldProps {
}

/** Renders a group of related checkboxes, allowing the user to select multiple options from a list. */
export interface CheckboxGroupFieldProps extends BaseFieldProps {
  /** An array of options, where each object represents a single checkbox in the group. */
  options: FormOption[];
  /** The visual layout of the checkboxes, either stacked vertically or in a horizontal row. */
  orientation?: 'vertical' | 'horizontal';
}

/** Renders a group of radio buttons, from which a user can select only one option. */
export interface RadioGroupFieldProps extends BaseFieldProps {
  /** An array of options, where each object represents a single radio button in the group. */
  options: FormOption[];
  /** The visual layout of the radio buttons. */
  orientation?: 'vertical' | 'horizontal';
}

/** Renders a toggle switch, a modern alternative to a checkbox for binary on/off states. */
export interface SwitchFieldProps extends BaseFieldProps {
  /** Optional text to display within the switch when it is in the "on" state. */
  onLabel?: string;
  /** Optional text to display within the switch when it is in the "off" state. */
  offLabel?: string;
}

// --- Specialized & Advanced Input Fields ---

/** Renders an input field for selecting dates, times, or both, using the browser's native picker UI. */
export interface DateTimeFieldProps extends BaseFieldProps {
  /** The type of picker to display to the user. */
  pickerType?: 'date' | 'time' | 'datetimeLocal';
  /** The earliest allowed date/time in ISO format (e.g., "2025-01-01"). */
  min?: string;
  /** The latest allowed date/time in ISO format (e.g., "2026-01-01"). */
  max?: string;
}

/** Renders a control that allows users to select one or more files from their device for upload. */
export interface FileUploadFieldProps extends BaseFieldProps {
  /** A comma-separated string of acceptable file types (e.g., "image/*, .pdf"). */
  accept?: string;
  /** If true, the user can select and upload multiple files at once. */
  isMulti?: boolean;
  /** The maximum size for any single file, specified in megabytes (MB). */
  maxFileSizeMB?: number;
}

/** Renders a slider control for selecting a numeric value from within a defined range. */
export interface SliderFieldProps extends BaseFieldProps {
  /** The minimum value of the slider range. */
  min: number;
  /** The maximum value of the slider range. */
  max: number;
  /** The increment value for the slider. */
  step?: number;
}

/** Renders a rating component, commonly used for star ratings. */
export interface RatingFieldProps extends BaseFieldProps {
    /** The total number of rating units to display (e.g., 5 for 5 stars). */
    count: number;
    /** The icon to use for the rating units (e.g., star, heart). */
    icon?: IconProps;
    /** If true, allows for half-unit selections (e.g., 4.5 stars). */
    allowHalf?: boolean;
}

/** 
 * Renders a color picker component, allowing the user to select a color.
 * This interface extends BaseFieldProps without additional properties,
 * serving as a distinct type in the FormField discriminated union.
 */
export interface ColorPickerFieldProps extends BaseFieldProps {
}

/** Renders a canvas for capturing a digital signature. */
export interface SignatureFieldProps extends BaseFieldProps {
    /** The text label for the button that clears the signature pad. */
    clearButtonText?: string;
    /** The placeholder text displayed inside the signature area. */
    promptText?: string;
}

// --- Non-Input & Structural Fields ---

/** Renders a hidden input field to store data that the user does not need to see. */
export interface HiddenFieldProps extends ComponentProps {
  /** The name used as a key for this field's value in the form data. */
  name: string;
  /** The value to be stored in the hidden field. */
  value: string | number;
}

/** Renders a heading element (e.g., H1, H2) to add titles or structure within the form. */
export interface HeadingFieldProps extends ComponentProps {
  /** The text content of the heading. */
  text: string;
  /** The semantic heading level from 1 to 6. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Renders a horizontal line to visually separate sections of the form. */
export interface DividerProps extends ComponentProps {
    /** Optional text to display in the middle of the divider line. */
    text?: string;
}

// --- Quiz & Exam Extensions ---

/** Represents a single answer choice within a quiz question. */
export interface QuizOption {
  /** The text content of the answer option. */
  text: string;
  /** If true, this option is the correct answer. */
  isCorrect: boolean;
  /** Optional feedback to show the user if they select this option. */
  feedback?: string;
}

/** Represents a single question in a quiz, exam, or survey. */
export interface QuizQuestionFieldProps extends BaseFieldProps {
  /** The type of question, which determines the input method (e.g., multiple choice or short answer). */
  questionType: 'multipleChoice' | 'trueFalse' | 'checkboxes' | 'shortAnswer';
  /** The array of possible answer choices for this question. */
  options?: QuizOption[];
  /** The number of points this question is worth. */
  points: number;
  /** An explanation of the correct answer, which can be shown after the user responds. */
  explanation?: string;
}

// --- Form Field Union Type ---

/** A discriminated union of all possible field types that can be included in a form. */
export type FormField =
  | TextFieldProps
  | TextAreaFieldProps
  | SelectFieldProps
  | CheckboxFieldProps
  | CheckboxGroupFieldProps
  | RadioGroupFieldProps
  | SwitchFieldProps
  | DateTimeFieldProps
  | FileUploadFieldProps
  | SliderFieldProps
  | RatingFieldProps
  | ColorPickerFieldProps
  | SignatureFieldProps
  | HiddenFieldProps
  | HeadingFieldProps
  | DividerProps
  | QuizQuestionFieldProps;

// --- Main Form & Quiz Interfaces ---

/** Defines a single "page" or "step" in a multi-step form. */
export interface FormStep {
    /** The title of the step, often shown in a stepper navigation component. */
    title: string;
    /** An array of the fields and fieldsets that belong to this step. */
    content: (FormField | FieldSetProps)[];
}

/** Represents a complete form, including its configuration, fields, and actions. */
export interface FormProps extends ComponentProps {
  /** The main title of the form, displayed at the top. */
  title: string;
  /** An optional description of the form's purpose, displayed below the title. */
  description?: string;
  /** The layout strategy for arranging the fields (e.g., 'singleColumn' or 'stepped'). */
  layout?: FormLayout;
  /** For single-page layouts, this is a flat array of the form's fields and fieldsets. */
  content: (FormField | FieldSetProps)[];
  /** For 'stepped' layouts, this is an array of the steps that make up the form. */
  steps?: FormStep[];
  /** An array of action buttons for the form, such as 'Submit' or 'Reset'. */
  actions: FormAction[];
  /** Secure backend service call to execute when the form is submitted. */
  onSubmitAction: ServiceCallProps;
  /** An object with initial values for the form fields, keyed by field 'name'. */
  initialValues?: Record<string, any>;
}

/** Represents a specialized form for a quiz, exam, or survey, with additional scoring and feedback options. */
export interface QuizFormProps extends FormProps {
  /** The minimum score required to pass the quiz. */
  passingScore?: number;
  /** If true, feedback is shown immediately after each question is answered. */
  showImmediateFeedback?: boolean;
  /** A time limit for the entire quiz, specified in seconds. */
  timeLimitSeconds?: number;
}

