const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Agregar extensiones de assets para modelos 3D
config.resolver.assetExts.push(
  'glb',
  'gltf',
  'png',
  'jpg',
  'obj',
  'mtl'
);

// Asegurarse de que las extensiones de código están correctas
config.resolver.sourceExts.push(
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs'
);

module.exports = withNativeWind(config, { input: './global.css' });