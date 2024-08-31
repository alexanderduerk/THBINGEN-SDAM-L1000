// config/config.js
const fs = require('fs');
const path = require('path');

// Path to the configuration file
const configPath = 'config.json';

// Read and parse the configuration file
const rawConfig = fs.readFileSync(configPath);
const config = JSON.parse(rawConfig);

module.exports = config;
