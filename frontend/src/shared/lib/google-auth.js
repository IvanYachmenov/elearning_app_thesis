/**
 * Google OAuth integration using Google Identity Services
 * Uses OAuth 2.0 Token Client for reliable button-based authentication
 */

let googleLoaded = false;
let tokenClient = null;

/**
 * Load Google Identity Services script
 */
export function loadGoogleScript() {
    if (googleLoaded || window.google) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            googleLoaded = true;
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load Google Identity Services'));
        };
        document.head.appendChild(script);
    });
}

/**
 * Initialize Google Sign-In with ID token callback
 * This initializes the ID token client for button-based authentication
 * @param {string} clientId - Google OAuth Client ID
 * @param {Function} callback - Callback function that receives the credential response
 */
export function initializeGoogleSignIn(clientId, callback) {
    return loadGoogleScript().then(() => {
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
            throw new Error('Google Identity Services not loaded');
        }

        // Initialize for ID token (used by buttons)
        // Enable FedCM explicitly for better compatibility
        // Debug: Log the current origin to help with configuration
        const currentOrigin = window.location.origin;
        console.log('[Google Auth] Initializing with Client ID:', clientId);
        console.log('[Google Auth] Current origin:', currentOrigin);
        console.log('[Google Auth] Make sure this origin is added in Google Cloud Console!');
        
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
                // Handle both success and error cases
                if (response.credential) {
                    callback(response);
                } else if (response.error) {
                    // User dismissed or error occurred
                    console.log('Google Sign-In error:', response.error);
                    // Only call callback with error for non-user-dismissal cases
                    if (response.error !== 'popup_closed_by_user' && 
                        response.error !== 'popup_blocked' &&
                        response.error !== 'access_denied') {
                        callback({ error: response.error });
                    }
                }
            },
            // Enable FedCM for button-based authentication
            // Temporarily try without explicit FedCM setting to see if it helps
            // use_fedcm_for_button: true,
        });

        // Also initialize OAuth 2.0 Token Client as fallback
        if (window.google.accounts.oauth2) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'openid profile email',
                callback: (tokenResponse) => {
                    // This would be for access tokens, but we prefer ID tokens
                    // So we'll use ID token flow instead
                },
            });
        }
    }).catch((error) => {
        console.error('Error loading Google script:', error);
        throw error;
    });
}

/**
 * Trigger Google Sign-In by rendering a button
 * This is the recommended way for button-based authentication
 * @param {HTMLElement} buttonElement - The button element to attach Google Sign-In to
 */
export function renderGoogleButton(buttonElement, clientId, callback) {
    if (!buttonElement) {
        console.error('Button element is required');
        return;
    }

    return loadGoogleScript().then(() => {
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
            throw new Error('Google Identity Services not loaded');
        }

        // Render the button
        window.google.accounts.id.renderButton(buttonElement, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: buttonElement.offsetWidth || 300,
        });

        // The callback is already set in initializeGoogleSignIn
    }).catch((error) => {
        console.error('Error rendering Google button:', error);
        throw error;
    });
}

/**
 * Trigger Google Sign-In programmatically using ID token client
 * This is an alternative to renderButton for custom buttons
 * @param {string} clientId - Google OAuth Client ID
 * @param {Function} callback - Callback function that receives the credential response
 */
export function requestGoogleIdToken(clientId, callback) {
    return loadGoogleScript().then(() => {
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
            throw new Error('Google Identity Services not loaded');
        }

        // Use ID token client to get token
        // We'll use a temporary button approach or One Tap prompt
        try {
            // For programmatic trigger, we can use One Tap but wrap it properly
            window.google.accounts.id.prompt((notification) => {
                // Handle notification silently
                if (notification.isNotDisplayed() || 
                    notification.isSkippedMoment() || 
                    notification.isDismissedMoment()) {
                    // User dismissed - this is fine
                    return;
                }
            });
        } catch (error) {
            // Handle abort errors gracefully
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                console.log('Google Sign-In was cancelled');
            } else {
                throw error;
            }
        }
    }).catch((error) => {
        console.error('Error requesting Google ID token:', error);
        throw error;
    });
}
