var balm = require('balm-light');

balm.config = {
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
  styles: {
    ext: 'scss'
  },
  scripts: {
    entry: {
      'mobile': './client/js/mobile.js',
      'web': './client/js/web.js'
    }
  }
};

balm.go();
