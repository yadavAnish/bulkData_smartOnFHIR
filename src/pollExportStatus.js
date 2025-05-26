const axios = require('axios');

async function pollExportStatus(contentLocation) {
  while (true) {
    const res = await axios.get(contentLocation);

    if (res.status === 202) {
      console.log("⏳ Export in progress... Retrying in 5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else if (res.status === 200) {
      console.log("✅ Export is ready!");
      return res.data;
    } else {
      throw new Error("Unexpected status code: " + res.status);
    }
  }
}

module.exports = pollExportStatus;
