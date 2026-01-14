const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Agregar extensiones de assets
config.resolver.assetExts.push(
  'glb',
  'gltf',
  'png',
  'jpg'
);

module.exports = withNativeWind(config, { input: './global.css' });