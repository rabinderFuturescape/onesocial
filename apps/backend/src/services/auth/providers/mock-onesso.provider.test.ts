import { MockOnessoProvider } from './mock-onesso.provider';

describe('MockOnessoProvider', () => {
  let provider: MockOnessoProvider;

  beforeEach(() => {
    provider = new MockOnessoProvider();
  });

  describe('generateLink', () => {
    it('should generate a mock authorization URL', () => {
      const link = provider.generateLink();
      
      expect(link).toBe('/auth/onesso/callback?code=MOCK_CODE');
    });
  });

  describe('getToken', () => {
    it('should return a mock access token', async () => {
      const token = await provider.getToken('any-code');
      
      expect(token).toBe('MOCK_ACCESS_TOKEN');
    });
  });

  describe('getUser', () => {
    it('should return a mock user when token is provided', async () => {
      const user = await provider.getUser('any-token');
      
      expect(user).toEqual({
        id: 'mock-user-id',
        email: 'demo@example.com'
      });
    });

    it('should return false when token is empty', async () => {
      const user = await provider.getUser('');
      
      expect(user).toBe(false);
    });
  });
});
