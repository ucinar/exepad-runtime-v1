/**
 * Service Call Utility
 * Handles secure backend service calls using predefined actionIds
 * instead of direct endpoint URLs for enhanced security.
 */

import { ServiceCallProps } from '@/interfaces/services/service_call';
import { actionIdToAPIEndpointMap } from '@/interfaces/services/service_call';

export interface ServiceCallResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Executes a service call based on the actionId
 * @param serviceCall - The service call configuration
 * @param formData - The form data to be sent
 * @param formId - The form's UUID for tracking
 * @returns Promise with the result of the service call
 */
export async function executeServiceCall(
  serviceCall: ServiceCallProps,
  formData: Record<string, any>,
  formId?: string
): Promise<ServiceCallResult> {
  try {
    // Get the endpoint configuration from the actionIdToAPIEndpointMap
    let endpointConfig = actionIdToAPIEndpointMap[serviceCall.actionId as keyof typeof actionIdToAPIEndpointMap];

    // If not found, try to auto-detect if it's a form submission
    // This allows LLMs to generate any form-related actionId dynamically
    if (!endpointConfig) {
      const actionIdLower = serviceCall.actionId.toLowerCase();
      const isFormSubmission = 
        formId !== undefined ||  // Has formId = definitely a form submission
        (actionIdLower.includes('submit') && actionIdLower.includes('form')) ||
        actionIdLower.includes('_form') ||
        actionIdLower.startsWith('submit_');
      
      if (isFormSubmission) {
        console.log(`[Service Call] Auto-detected form submission for actionId: "${serviceCall.actionId}"`);
        console.log(`[Service Call] Routing to generic form endpoint with formId: ${formId}`);
        
        // Use the standard form submission configuration
        endpointConfig = {
          endpoint: "/api/forms/submit/",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: {
            formData: {
              formId: "string",
              formData: "string"
            }
          }
        };
      }
    }

    if (!endpointConfig) {
      console.error(`[Service Call] Unknown actionId: ${serviceCall.actionId}`);
      return {
        success: false,
        error: `Invalid action: ${serviceCall.actionId}`
      };
    }

    // Get the API base URL from environment variables
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fullEndpoint = `${apiBaseUrl}${endpointConfig.endpoint}`;

    console.log(`[Service Call] Executing ${serviceCall.actionId} to ${fullEndpoint}`);

    // Prepare the request body based on the endpoint configuration
    let requestBody: any = {};
    
    if (endpointConfig.body) {
      // Build the body structure from the configuration
      if (endpointConfig.body.formData) {
        requestBody = {
          formId: formId || '',
          formData: JSON.stringify(formData)
        };
      } else {
        requestBody = formData;
      }
    }

    // Make the API call
    const response = await fetch(fullEndpoint, {
      method: endpointConfig.method,
      headers: {
        ...endpointConfig.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Service Call] Error response:', responseData);
      return {
        success: false,
        error: responseData.detail || responseData.message || `Server error: ${response.status}`
      };
    }

    console.log('[Service Call] Success:', responseData);
    return {
      success: true,
      data: responseData
    };

  } catch (error: any) {
    console.error('[Service Call] Exception:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
}

/**
 * Handles the success action after a successful service call
 * @param onSuccessAction - The success action configuration
 * @param formResetFn - Optional callback to reset the form
 */
export function handleSuccessAction(
  onSuccessAction: ServiceCallProps['onSuccessAction'],
  formResetFn?: () => void
): void {
  if (!onSuccessAction) return;

  switch (onSuccessAction.type) {
    case 'redirect':
      if (onSuccessAction.payload?.url) {
        console.log('[Service Call] Redirecting to:', onSuccessAction.payload.url);
        window.location.href = onSuccessAction.payload.url;
      }
      break;

    case 'clearForm':
      if (formResetFn) {
        console.log('[Service Call] Clearing form');
        formResetFn();
      }
      break;

    case 'custom':
      if (onSuccessAction.payload?.customAction) {
        console.log('[Service Call] Custom action:', onSuccessAction.payload.customAction);
        // You can implement custom action handlers here
        // e.g., dispatch custom events or call registered handlers
      }
      break;

    default:
      console.warn('[Service Call] Unknown success action type:', onSuccessAction.type);
  }
}

