// This script helps Node.js resolve module paths correctly
const path = require('path');
const tsConfigPaths = require('tsconfig-paths');

const baseUrl = path.join(__dirname, 'dist');
const mainTsConfig = require('./tsconfig.json');

// Extract paths from tsconfig
const { paths = {} } = mainTsConfig.compilerOptions;

// Register paths
tsConfigPaths.register({
  baseUrl,
  paths,
});

// After registering paths, require the compiled main.js file
require('./dist/main');
