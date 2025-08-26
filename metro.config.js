const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

// 1. Agrega la carpeta `node_modules` del proyecto al resolver.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// 2. Resuelve explícitamente la dependencia problemática de Solana.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  util: require.resolve('util'),
};

// 3. Solucionador personalizado para manejar las exportaciones de paquetes de Privy y otras incompatibilidades.
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  console.log("Resolving:", moduleName);
  // Las exportaciones de paquetes en `isows` (una dependencia de `viem`) son incompatibles, por lo que deben deshabilitarse
  if (moduleName === "isows") {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Las exportaciones de paquetes en `zustand@4` son incompatibles, por lo que deben deshabilitarse
  if (moduleName.startsWith("zustand")) {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Las exportaciones de paquetes en `jose` son incompatibles, por lo que se utiliza la versión del navegador
  if (moduleName === "jose") {
    const ctx = { ...context, unstable_conditionNames: ["browser"] };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // El siguiente bloque solo es necesario si estás
  // ejecutando React Native 0.78 *o anterior*.
  if (moduleName.startsWith('@privy-io/')) {
    const ctx = { ...context, unstable_enablePackageExports: true };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

module.exports = withNativeWind(config, { input: './global.css' });