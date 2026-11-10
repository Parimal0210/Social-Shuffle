/**
 * Official Google Identity Services (GIS) & Google OAuth 2.0 Web Client Integration
 * Uses accounts.google.com/gsi/client to prompt Google's native browser account selector,
 * retrieve verified profile details directly from Google's UserInfo API, and authenticate
 * without any custom or mocked account selection modals.
 */

import { GoogleUserProfile } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
              expires_in?: number;
              token_type?: string;
              scope?: string;
            }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notificationCallback?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

// Official Google OAuth 2.0 Client ID provisioned for this project in Google Cloud Console
// Hardcoded Client ID commented out:
// '13280287385-p4ts02igubi7r9cvd2dnkbf5t4d4gbpi.apps.googleusercontent.com'
export const DEFAULT_GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID)
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID
    : '';

/**
 * Ensures Google Identity Services client script is loaded on the page.
 */
export async function ensureGoogleScriptLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
    return true;
  }

  return new Promise((resolve) => {
    // Check if script element already exists
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(Boolean(window.google?.accounts));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    }
  });
}

/**
 * Decodes standard Google Identity JWT (OpenID Connect ID Token)
 */
export function decodeGoogleJwt(jwtToken: string): GoogleUserProfile | null {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data = JSON.parse(jsonPayload);
    if (!data.email) return null;

    return {
      email: data.email.toLowerCase(),
      name: data.name || data.given_name || 'Google User',
      avatar: data.picture,
      googleId: data.sub
    };
  } catch (err) {
    console.error('Failed to parse Google JWT payload:', err);
    return null;
  }
}

/**
 * Calls Google's official UserInfo API (https://www.googleapis.com/oauth2/v3/userinfo)
 * using the OAuth access token returned by Google Identity Services.
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Google UserInfo API returned status ${response.status}`);
  }

  const data = await response.json();
  if (!data.email) {
    throw new Error('Google did not return an email address for this account.');
  }

  return {
    email: data.email.toLowerCase(),
    name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'Google User',
    avatar: data.picture,
    googleId: data.sub
  };
}

/**
 * Invokes Google's official OAuth 2.0 Account Chooser Popup.
 * Calling this directly displays Google's native popup window where users can choose
 * from any of the accounts logged into their browser or add a new Google account.
 * No custom modal is rendered in our app.
 */
export async function promptGoogleAccountChooser(options?: {
  clientId?: string;
  prompt?: 'select_account' | 'consent' | 'none';
}): Promise<GoogleUserProfile> {
  const isLoaded = await ensureGoogleScriptLoaded();
  if (!isLoaded || !window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services is currently unavailable. Please check your internet connection.');
  }

  const clientId = options?.clientId || DEFAULT_GOOGLE_CLIENT_ID;

  return new Promise((resolve, reject) => {
    let resolved = false;

    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: options?.prompt || 'select_account', // Forces Google's native browser account selector
        callback: async (tokenResponse) => {
          if (resolved) return;
          if (tokenResponse.error) {
            resolved = true;
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          if (!tokenResponse.access_token) {
            resolved = true;
            reject(new Error('Google did not provide an access token.'));
            return;
          }

          try {
            // Call official Google UserInfo API endpoint to fetch the user's profile
            const profile = await fetchGoogleUserInfo(tokenResponse.access_token);
            resolved = true;
            resolve(profile);
          } catch (err: any) {
            resolved = true;
            reject(err);
          }
        },
        error_callback: (err: any) => {
          if (resolved) return;
          resolved = true;
          const msg = err?.message || 'Google Sign-In popup was closed or blocked.';
          reject(new Error(msg));
        }
      });

      // Launch Google's native popup to select browser accounts
      tokenClient.requestAccessToken({ prompt: options?.prompt || 'select_account' });
    } catch (err: any) {
      reject(new Error(err?.message || 'Failed to initialize Google Account Chooser.'));
    }
  });
}

/**
 * Initializes and renders the official Google Sign-In HTML5 button inside a container.
 */
export async function renderOfficialGoogleButton(
  container: HTMLElement,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError: (error: string) => void,
  options?: {
    clientId?: string;
    text?: 'continue_with' | 'signin_with' | 'signup_with';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    width?: number | string;
  }
): Promise<boolean> {
  const isLoaded = await ensureGoogleScriptLoaded();
  if (!isLoaded || !window.google?.accounts?.id) {
    return false;
  }

  const clientId = options?.clientId || DEFAULT_GOOGLE_CLIENT_ID;

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        if (!credentialResponse?.credential) {
          onError('No credential received from Google.');
          return;
        }
        const profile = decodeGoogleJwt(credentialResponse.credential);
        if (profile) {
          onSuccess(profile);
        } else {
          onError('Failed to decode profile from Google.');
        }
      }
    });

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: options?.theme || 'outline',
      size: 'large',
      text: options?.text || 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: options?.width || '100%'
    });

    return true;
  } catch (err: any) {
    console.warn('Could not render official Google button:', err);
    return false;
  }
}
