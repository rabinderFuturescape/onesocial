# Authentication Providers

This document provides a detailed overview of all authentication providers supported by the Postiz application.

## Table of Contents

1. [Provider Enum Values](#provider-enum-values)
2. [Authentication Provider Implementations](#authentication-provider-implementations)
   - [Backend Authentication Providers](#backend-authentication-providers)
   - [Frontend Authentication Components](#frontend-authentication-components)
   - [Provider Factory](#provider-factory)
3. [Authentication Flow by Provider](#authentication-flow-by-provider)
   - [Local Authentication](#local-authentication)
   - [GitHub Authentication](#github-authentication)
   - [Google Authentication](#google-authentication)
   - [Farcaster Authentication](#farcaster-authentication)
   - [Wallet Authentication](#wallet-authentication)
4. [Social Media Integration Providers](#social-media-integration-providers)
5. [Article Publishing Providers](#article-publishing-providers)

## Provider Enum Values

The Provider enum is defined in the Prisma schema file (`libraries/nestjs-libraries/src/database/prisma/schema.prisma`) and contains the following values:

```prisma
enum Provider {
  LOCAL
  GITHUB
  GOOGLE
  FARCASTER
  WALLET
}
```

These enum values are used throughout the application to identify the authentication method used by a user.

## Authentication Provider Implementations

### Backend Authentication Providers

These providers implement the `ProvidersInterface` defined in `apps/backend/src/services/auth/providers.interface.ts`:

```typescript
export interface ProvidersInterface {
    generateLink(query?: any): Promise<string> | string;
    getToken(code: string): Promise<string>;
    getUser(providerToken: string): Promise<{email: string, id: string}> | false;
}
```

| Provider Class | File Path | Enum Key | Description |
|---------------|-----------|----------|-------------|
| `GithubProvider` | `apps/backend/src/services/auth/providers/github.provider.ts` | `Provider.GITHUB` | GitHub OAuth authentication |
| `GoogleProvider` | `apps/backend/src/services/auth/providers/google.provider.ts` | `Provider.GOOGLE` | Google OAuth authentication |
| `FarcasterProvider` | `apps/backend/src/services/auth/providers/farcaster.provider.ts` | `Provider.FARCASTER` | Farcaster authentication using Neynar API |
| `WalletProvider` | `apps/backend/src/services/auth/providers/wallet.provider.ts` | `Provider.WALLET` | Cryptocurrency wallet authentication (Solana) |

The `LOCAL` provider doesn't have a specific implementation class as it's handled directly in the authentication service for username/password authentication.

### Frontend Authentication Components

These components handle the frontend UI for authentication:

| Component | File Path | Related Provider |
|-----------|-----------|-----------------|
| `GithubProvider` | Referenced in login/register components | `Provider.GITHUB` |
| `GoogleProvider` | Referenced in login/register components | `Provider.GOOGLE` |
| `FarcasterProvider` | `apps/frontend/src/components/auth/providers/farcaster.provider.tsx` | `Provider.FARCASTER` |
| `WalletProvider` | `apps/frontend/src/components/auth/providers/wallet.provider.tsx` | `Provider.WALLET` |
| `WalletUiProvider` | `apps/frontend/src/components/auth/providers/placeholder/wallet.ui.provider.tsx` | UI component for wallet authentication |

### Provider Factory

The `ProvidersFactory` class in `apps/backend/src/services/auth/providers/providers.factory.ts` is responsible for instantiating the appropriate provider based on the enum value:

```typescript
export class ProvidersFactory {
  static loadProvider(provider: Provider): ProvidersInterface {
    switch (provider) {
      case Provider.GITHUB:
        return new GithubProvider();
      case Provider.GOOGLE:
        return new GoogleProvider();
      case Provider.FARCASTER:
        return new FarcasterProvider();
      case Provider.WALLET:
        return new WalletProvider();
    }
  }
}
```

## Authentication Flow by Provider

### Local Authentication

1. **Registration**:
   - User provides email and password
   - Password is hashed using bcrypt
   - User record is created in the database with `providerName: Provider.LOCAL`

2. **Login**:
   - User provides email and password
   - Password is verified against the hashed version in the database
   - JWT token is generated and stored in an HTTP-only cookie

### GitHub Authentication

1. **Initiation**:
   - User clicks "Continue with GitHub" button
   - Frontend redirects to GitHub OAuth URL generated by `GithubProvider.generateLink()`
   - GitHub OAuth URL includes client ID and redirect URI

2. **Authorization**:
   - User authorizes the application on GitHub
   - GitHub redirects back to the application with an authorization code

3. **Token Exchange**:
   - Backend exchanges the authorization code for an access token using `GithubProvider.getToken()`
   - GitHub user information is retrieved using `GithubProvider.getUser()`
   - User is created or updated in the database with `providerName: Provider.GITHUB`
   - JWT token is generated and stored in an HTTP-only cookie

### Google Authentication

1. **Initiation**:
   - User clicks "Continue with Google" button
   - Frontend redirects to Google OAuth URL generated by `GoogleProvider.generateLink()`
   - Google OAuth URL includes client ID, scope, and redirect URI

2. **Authorization**:
   - User authorizes the application on Google
   - Google redirects back to the application with an authorization code

3. **Token Exchange**:
   - Backend exchanges the authorization code for an access token using `GoogleProvider.getToken()`
   - Google user information is retrieved using `GoogleProvider.getUser()`
   - User is created or updated in the database with `providerName: Provider.GOOGLE`
   - JWT token is generated and stored in an HTTP-only cookie

### Farcaster Authentication

1. **Initiation**:
   - User clicks "Continue with Farcaster" button
   - Frontend initiates Farcaster authentication using Neynar API

2. **Authorization**:
   - User authorizes the application on Farcaster
   - Farcaster provides a signer UUID

3. **Token Exchange**:
   - Backend verifies the signer UUID using `FarcasterProvider.getToken()`
   - Farcaster user information is retrieved using `FarcasterProvider.getUser()`
   - User is created or updated in the database with `providerName: Provider.FARCASTER`
   - JWT token is generated and stored in an HTTP-only cookie

### Wallet Authentication

1. **Initiation**:
   - User clicks "Continue with your Wallet" button
   - Frontend opens wallet selection modal

2. **Wallet Connection**:
   - User selects and connects their wallet (Phantom, Solflare, etc.)
   - Backend generates a challenge string and stores it in Redis

3. **Signature Verification**:
   - User signs the challenge with their wallet
   - Backend verifies the signature using `WalletProvider.getToken()`
   - Wallet user information is created using the public key
   - User is created or updated in the database with `providerName: Provider.WALLET`
   - JWT token is generated and stored in an HTTP-only cookie

## Social Media Integration Providers

While not directly used for authentication, the application also supports various social media integrations through the `SocialProvider` interface defined in `libraries/nestjs-libraries/src/integrations/social/social.integrations.interface.ts`:

| Provider Class | Description |
|---------------|-------------|
| `XProvider` | Twitter/X integration |
| `LinkedinProvider` | LinkedIn personal profile integration |
| `LinkedinPageProvider` | LinkedIn company page integration |
| `RedditProvider` | Reddit integration |
| `InstagramProvider` | Instagram integration |
| `InstagramStandaloneProvider` | Instagram standalone integration |
| `FacebookProvider` | Facebook integration |
| `ThreadsProvider` | Threads integration |
| `YoutubeProvider` | YouTube integration |
| `TiktokProvider` | TikTok integration |
| `PinterestProvider` | Pinterest integration |
| `DribbbleProvider` | Dribbble integration |
| `DiscordProvider` | Discord integration |
| `SlackProvider` | Slack integration |
| `MastodonProvider` | Mastodon integration |
| `BlueskyProvider` | Bluesky integration |
| `LemmyProvider` | Lemmy integration |
| `FarcasterProvider` | Farcaster integration |
| `TelegramProvider` | Telegram integration |
| `NostrProvider` | Nostr protocol integration |
| `VkProvider` | VK integration |

## Article Publishing Providers

The application also supports article publishing integrations through the `ArticleProvider` interface:

| Provider Class | Description |
|---------------|-------------|
| `DevToProvider` | Dev.to article publishing |
| `HashnodeProvider` | Hashnode article publishing |
| `MediumProvider` | Medium article publishing |

These providers allow users to publish content to various article platforms directly from the application.
