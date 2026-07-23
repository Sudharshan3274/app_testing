const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block non-mobile directories to avoid file-watcher / OneDrive interference
config.resolver.blockList = [
  /\.claude\/.*/,
  /\.idea\/.*/,
  /\.git\/.*/,
  /\.github\/.*/,
  /android\/.*/,
  /security_audit\/.*/,
  /\.agents\/.*/,
];

module.exports = config;
