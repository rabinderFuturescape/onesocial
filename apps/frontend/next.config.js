//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/vgr
    svgr: false,
  },
  transpilePackages: ['crypto-hash'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/api/uploads/:path*',
        destination:
          process.env.STORAGE_PROVIDER === 'local' ? '/uploads/:path*' : '/404',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination:
          process.env.STORAGE_PROVIDER === 'local'
            ? '/api/uploads/:path*'
            : '/404',
      },
    ];
  },
  webpack(config, { dev, isServer }) {
    // Only in development on the server
    if (dev && isServer) {
      config.plugins.forEach(plugin => {
        if (plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') {
          // Give it up to 8 GB of RAM:
          plugin.options.memoryLimit = 8192;
          console.log(
            '[next.config.js] Increased TypeScript memoryLimit to',
            plugin.options.memoryLimit
          );

          // Turn off async so errors block the build rather than spawning a separate process
          plugin.options.async = false;
          console.log('[next.config.js] Set TypeScript checker to synchronous mode');

          // Further constrain what it checks:
          plugin.options.typescript = {
            enabled: true,
            configOverwrite: {
              include: ['apps/frontend/**/*.{ts,tsx}', 'libraries/**/*.{ts,tsx}'],
              exclude: ['node_modules', '.next', 'dist']
            }
          };
          console.log('[next.config.js] Optimized TypeScript checker file patterns');
        }
      });
    }
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
