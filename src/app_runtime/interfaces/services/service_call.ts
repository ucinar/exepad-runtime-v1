  export var actionIdToAPIEndpointMap = {
    // Form submission endpoint - supports any form-related actionId via auto-detection
    // Examples: submit_form, submit_contact_form, submit_feedback_form, etc.
    // The runtime will auto-detect form submissions based on actionId patterns
    "submit_form": {
      "endpoint": "/api/forms/submit/",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "formData": {
          "formId": "string", //form UUID
          "formData": "string" //form data in json string format
        }
      }
    },
  }

  /**
   * Defines a SECURE contract for making a backend service call from a component.
   * Instead of an endpoint, it uses a predefined actionId that is
   * validated on the backend.
   */
  export interface ServiceCallProps {
    /**
     * A unique, secure identifier for the backend action to be performed.
     * This is NOT a URL path. It's a key that maps to a function on the backend.
     * Examples: submit_form, submit_contact_form, join_waitlist, newsletter_subscribe, etc.
     */
    actionId: string;
    
    /** A user-friendly message to display upon a successful API call. */
    successMessage: string;
  
    /** A user-friendly message to display if the API call fails. */
    errorMessage: string;
    
    /** 
     * The type of notification to display after the API call.
     * - 'toast': Temporary popup in corner (auto-dismisses after 5 seconds, non-intrusive)
     * - 'inline': Simple inline message in form (clean, minimal border)
     * - 'alert': Standard alert box with icon (default shadcn alert styling)
     * - 'banner': Prominent full-width banner with thick left border (bold, high visibility)
     * - 'minimal': Very subtle text-only message (no borders, no background, just colored text)
     * - 'none': No visual notification (silent, useful for background operations)
     */
    notificationType: 'toast' | 'inline' | 'alert' | 'banner' | 'minimal' | 'none';

    /** Whether to notify the admin after the API call. */
    notifyAdmin: 'none' | 'email' | 'slack';

    /** An optional action to perform after a successful API call. */
    onSuccessAction?: {
      /** The type of action to perform. */
      type: 'redirect' | 'clearForm' | 'custom';
      
      /** The data needed to perform the action. */
      payload?: {
        /** For 'redirect', the URL to navigate to. */
        url?: string;
        /** For 'showModal', the ID of the modal to open. */
        modalId?: string;
        /** For 'custom', the custom action to perform. */
        customAction?: string;
      };
    };
  }
  