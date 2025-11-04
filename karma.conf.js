module.exports = function karma (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'), 
    ],
    client: {
      clearContext: false 
    },
    
    reporters: ['progress', 'kjhtml', 'coverage'], 

    coverageReporter: {
      dir: require('node:path').join(__dirname, './coverage'), 
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' }, 
        { type: 'text-summary' }
      ]
    },
    
 
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true,
    restartOnFileChange: true
  });
};