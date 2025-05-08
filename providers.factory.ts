import { Provider } from '@prisma/client';
import { GithubProvider } from '@gitroom/backend/services/auth/providers/github.provider';
import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';
import { GoogleProvider } from '@gitroom/backend/services/auth/providers/google.provider';
import { FarcasterProvider } from '@gitroom/backend/services/auth/providers/farcaster.provider';
import { WalletProvider } from '@gitroom/backend/services/auth/providers/wallet.provider';
import { OauthProvider } from '@gitroom/backend/services/auth/providers/oauth.provider';
import { OneSSoProvider } from '@gitroom/backend/services/auth/providers/onesso.provider';

export class ProvidersFactory {
  static loadProvider(provider: Provider): ProvidersInterface {
    // Always return the OneSSoProvider to strictly use Keycloak for authentication
    return new OneSSoProvider();
  }
}
