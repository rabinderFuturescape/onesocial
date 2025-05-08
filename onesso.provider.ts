import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';

export class OneSSoProvider implements ProvidersInterface {
  private readonly authUrl: string;
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly realm: string;

  constructor() {
    const {
      ONESSO_BASE_URL,
      ONESSO_REALM,
      ONESSO_CLIENT_ID,
      ONESSO_CLIENT_SECRET,
      ONESSO_REDIRECT_URI,
    } = process.env;

    if (!ONESSO_BASE_URL)
      throw new Error('ONESSO_BASE_URL environment variable is not set');
    if (!ONESSO_REALM)
      throw new Error('ONESSO_REALM environment variable is not set');
    if (!ONESSO_CLIENT_ID)
      throw new Error('ONESSO_CLIENT_ID environment variable is not set');
    if (!ONESSO_CLIENT_SECRET)
      throw new Error('ONESSO_CLIENT_SECRET environment variable is not set');
    if (!ONESSO_REDIRECT_URI)
      throw new Error('ONESSO_REDIRECT_URI environment variable is not set');

    this.baseUrl = ONESSO_BASE_URL;
    this.realm = ONESSO_REALM;
    this.clientId = ONESSO_CLIENT_ID;
    this.clientSecret = ONESSO_CLIENT_SECRET;
    this.redirectUri = ONESSO_REDIRECT_URI;
    this.authUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/auth`;
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token request failed: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async getUser(accessToken: string): Promise<{ email: string; id: string }> {
    const userInfoUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    
    const response = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`User info request failed: ${error}`);
    }

    const data = await response.json();
    return {
      email: data.email,
      id: data.sub,
    };
  }
}
