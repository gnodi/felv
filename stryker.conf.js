'use strict';

module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'mocha',
  coverageAnalysis: 'perTest',
  thresholds: {high: 90, low: 80, break: 75},
  mutate: [
    'src/**/*.js'
  ],
  files: [
    'src/**/*.js',
    'test/**/*.js'
  ],
  mochaOptions: {
    // Optional mocha options
    spec: ['test/unit/**/*.js']
  }
};
