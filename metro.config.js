// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

// Apply NativeWind first
config = withNativeWind(config, { input: './global.css' });

// Store the original resolver from NativeWind
const originalResolveRequest = config.resolver.resolveRequest;

// 1. Agrega soporte para `sourceExts` de React Native.
config.resolver.sourceExts.push('mjs');

// 2. Resuelve explícitamente la dependencia problemática de Solana.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  util: require.resolve('util'),
};

// 3. Solucionador personalizado para manejar las exportaciones de paquetes de Privy y otras incompatibilidades.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Las exportaciones de paquetes en `isows` (una dependencia de `viem`) son incompatibles, por lo que deben deshabilitarse
  if (moduleName === "isows") {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return originalResolveRequest(ctx, moduleName, platform);
  }

  // Las exportaciones de paquetes en `zustand@4` son incompatibles, por lo que deben deshabilitarse
  if (moduleName.startsWith("zustand")) {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return originalResolveRequest(ctx, moduleName, platform);
  }

  // Las exportaciones de paquetes en `jose` son incompatibles, por lo que se utiliza la versión del navegador
  if (moduleName === "jose") {
    const ctx = { ...context, unstable_conditionNames: ["browser"] };
    return originalResolveRequest(ctx, moduleName, platform);
  }

  // El siguiente bloque solo es necesario si estás ejecutando React Native 0.78 *o anterior*.
  if (moduleName.startsWith('@privy-io/')) {
    const ctx = { ...context, unstable_enablePackageExports: true };
    return originalResolveRequest(ctx, moduleName, platform);
  }

  // Fallback to the original resolver
  return originalResolveRequest(context, moduleName, platform);
};

module.exports = config;