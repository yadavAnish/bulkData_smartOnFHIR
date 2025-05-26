const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

const groupId = 'BMCHealthNet';
const fhirBaseUrl = 'https://bulk-data.smarthealthit.org/eyJlcnIiOiIiLCJwYWdlIjoxMDAwMCwidGx0IjoxNSwibSI6MSwiZGVsIjowLCJzZWN1cmUiOjAsIm9wcCI6MTB9/fhir';
const exportUrl = `${fhirBaseUrl}/Group/${groupId}/$export`;

async function triggerExport() {
  const res = await axios.get(exportUrl, {
    headers: {
      'Accept': 'application/fhir+json',
      'Prefer': 'respond-async'
    }
  });
  return res.headers['content-location'];
}

async function getExportStatus(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          if (data.startsWith('<')) {
            return reject(new Error('Received HTML response instead of JSON. Likely an invalid export URL.'));
          }
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => {
        fs.unlink(outputPath, () => reject(err));
      });
    });
  });
}

function parseAbnormalObservations(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  const abnormalObs = [];

  for (const line of lines) {
    if (!line) continue;
    const obs = JSON.parse(line);

    const value = obs.valueQuantity?.value || 0;
    if (value > 100) {
      abnormalObs.push({
        subject: obs.subject?.reference || 'Unknown patient',
        code: obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown code',
        value,
      });
    }
  }
  return abnormalObs;
}

async function sendEmail(abnormalObservations) {
  if (abnormalObservations.length === 0) {
    console.log('✅ No abnormal observations to report.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'lew.johns62@ethereal.email',
      pass: 'WDSBFTSR9bM68Khjdg',
    },
  });

  const body = abnormalObservations
    .map((obs) => `Patient: ${obs.subject}, Code: ${obs.code}, Value: ${obs.value}`)
    .join('\n');

  await transporter.sendMail({
    from: 'labmonitor@yourapp.com',
    to: 'labalerts@hospital.com',
    subject: 'Abnormal Lab Observations Detected',
    text: body,
  });

  console.log('📧 Email sent with abnormal observations!');
}

async function main() {
  try {
    console.log('🚀 Starting SMART Bulk Data job...');

    const contentLocation = await triggerExport();
    console.log('📦 Export started. Polling status at:', contentLocation);

    let status;
    while (true) {
      status = await getExportStatus(contentLocation);

      if (status.transactionTime) {
        console.log('✅ Export is ready!');
        break;
      }

      console.log('⏳ Export in progress. Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (!Array.isArray(status.output)) {
      throw new Error('Invalid export status: no output field.');
    }

    for (const file of status.output) {
      const filename = path.basename(file.url);
      const filePath = path.join(__dirname, filename);
      if (fs.existsSync(filePath)) {
        console.log(`📁 File already exists, skipping: ${filename}`);
        continue;
      }
      console.log(`⬇️ Downloading ${filename}...`);
      await downloadFile(file.url, filePath);
      console.log(`✅ Downloaded ${filename}`);
    }

    const files = fs.readdirSync(__dirname);
    const obsFile = files.find(f => f.toLowerCase().includes('observation') && f.endsWith('.ndjson'));

    if (!obsFile) {
      console.error('❌ Observation NDJSON file not found.');
      return;
    }

    console.log('🔍 Parsing file:', obsFile);
    const abnormalObservations = parseAbnormalObservations(path.join(__dirname, obsFile));
    await sendEmail(abnormalObservations);
  } catch (err) {
    console.error('❌ Job failed:', err.message);
  }
}

main();
