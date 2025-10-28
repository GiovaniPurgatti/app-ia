module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo'],
      'nativewind/babel'
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      ['react-native-worklets/plugin', {}, 'worklets-plugin'], // nome único
      ['react-native-reanimated/plugin', {}, 'reanimated-plugin'], // nome único
    ],
  };
};
