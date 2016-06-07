var balm = require('balm');

balm.config = {
  static: true,
  roots: {
    app: 'client'
  },
  paths: {
    app: {
      css: '/css',
      js: '/js',
      img: '/img'
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
