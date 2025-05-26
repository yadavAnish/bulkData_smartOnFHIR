const axios = require('axios');

async function requestBulkData() {
  const fhirBaseUrl = 'https://bulk-data.smarthealthit.org/eyJlcnIiOiIiLCJwYWdlIjoxMDAwMCwidGx0IjoxNSwibSI6MSwiZGVsIjowLCJzZWN1cmUiOjAsIm9wcCI6MTB9/fhir';
  const groupId = 'BMCHealthNet';

  const response = await axios.get(`${fhirBaseUrl}/Group/${groupId}/$export`, {
    headers: {
      'Accept': 'application/fhir+json',
      'Prefer': 'respond-async'
    }
  });

  console.log('📦 Content-Location:', response.headers['content-location']);
  return response.headers['content-location'];
}

module.exports = requestBulkData;
