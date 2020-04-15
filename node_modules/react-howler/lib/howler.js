'use strict';

var Howler = void 0;

if (typeof window !== 'undefined') {
  Howler = require('howler');
}

module.exports = Howler;