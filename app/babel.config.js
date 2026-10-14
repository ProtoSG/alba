module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 3 (Expo SDK 52) needs its plugin explicitly, and it must be last. Required on web too.
    plugins: ['react-native-reanimated/plugin'],
  };
};
