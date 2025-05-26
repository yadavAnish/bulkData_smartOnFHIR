const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function generateJWT() {
  // Load private key from file
  const privateKey = fs.readFileSync(path.join(__dirname, 'privatekey.pem'), 'utf8');

  // Epic non-production client ID from your app
  const clientId = '6cbfb432-5bbf-46eb-871a-ae6d9a071e3d';

  // const clientId= 'c0af5c35-7a20-4ebc-b982-468de86db849';

  // Current time in seconds (Epoch)
  const now = Math.floor(Date.now() / 1000);

  // JWT payload
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    jti: uuidv4(),               // Unique ID
    iat: now,
    nbf: now,
    exp: now + 300               // +5 minutes
  };

  // JWT header
  const header = {
    alg: 'RS384',
    typ: 'JWT'
  };

  // Sign the JWT
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS384',
    header
  });

  // console.log("generated:\n", token);
  return token;
}

module.exports = generateJWT;
