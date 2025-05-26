const axios = require('axios');

async function getAccessToken(jwtToken) {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    params.append('client_assertion', jwtToken);
    // params.append('scope', 'system/Observation.read system/Patient.read system/Group.read system/$export');

    const response = await axios.post(
      'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // console.log('inside get access token',response);
    // console.log('inside get access token',response.data);
    // console.log('Access TOken is ',response.data.access_token);


    return response.data;

  } catch (error) {
    console.error('❌ Failed to get access token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = getAccessToken;
