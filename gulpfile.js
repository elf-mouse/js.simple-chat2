var balm = require('balm');

balm.config = {
  static: true,
  roots: {
    source: 'client'
  },
  paths: {
    source: {
      css: 'css',
      js: 'js',
      img: 'img'
    }
  },
  scripts: {
    entry: {
      'mobile': './client/js/mobile.js',
      'web': './client/js/web.js'
    }
  }
};

balm.go();
