const tsConfigPaths = require('tsconfig-paths');
const { compilerOptions } = require('./tsconfig.json');

// This is needed to map the paths from tsconfig.json to the compiled js files
tsConfigPaths.register({
  baseUrl: '.',
  paths: {
    'src/*': ['dist/*'],
  },
});
