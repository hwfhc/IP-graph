'use strict';

const fs = require('fs');
const webpack = require('webpack');
const config = require('./config.js');


const [,,type] = process.argv;

var mode;

if(type === '--production') mode = config.production;
else mode = config.develop

mode.forEach(item => webpack(item,() => console.log('over')));
