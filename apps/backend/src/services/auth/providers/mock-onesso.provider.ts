import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';

export class MockOnessoProvider implements ProvidersInterface {
  generateLink(): string {
    // Skip real redirect—preserve state for callback
    return `/auth/onesso/callback?code=MOCK_CODE`;
  }

  async getToken(code: string): Promise<string> {
    // Always return a fixed "token"
    return 'MOCK_ACCESS_TOKEN';
  }

  async getUser(accessToken: string): Promise<{ email: string; id: string }> | false {
    if (!accessToken) {
      return false;
    }

    // Return a fake user record
    return {
      id: 'mock-user-id',
      email: 'demo@example.com'
    };
  }
}
