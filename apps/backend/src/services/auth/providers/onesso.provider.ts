import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

export class OnessoProvider implements ProvidersInterface {
  private baseUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.baseUrl = process.env.ONESSO_BASE_URL || 'http://keycloak:8080';
    this.realm = process.env.ONESSO_REALM || 'postiz-realm';
    this.clientId = process.env.ONESSO_CLIENT_ID || 'postiz-client';
    this.clientSecret = process.env.ONESSO_CLIENT_SECRET || 'changeme';
    this.redirectUri = process.env.ONESSO_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/onesso/callback`;
  }

  generateLink(): string {
    const authUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/auth`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
    });

    return `${authUrl}?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async getUser(accessToken: string): Promise<{ email: string; id: string }> | false {
    if (!accessToken) {
      return false;
    }

    const userInfoUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    const response = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const userData = await response.json();
    
    if (!userData.email || !userData.sub) {
      return false;
    }

    return {
      email: userData.email,
      id: userData.sub, // Use the subject identifier as the unique ID
    };
  }
}
