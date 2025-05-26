const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadAndParse(url) {
  // Simulate by loading from local sample file
  const filePath = path.join(__dirname, 'sample.Observation.ndjson');
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.trim().split('\n').map(line => JSON.parse(line));
  return lines;
}

module.exports = downloadAndParse;
