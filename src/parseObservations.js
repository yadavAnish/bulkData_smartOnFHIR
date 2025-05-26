function parseObservations(observations) {
  return observations.filter(obs => {
    if (!obs.valueQuantity || !obs.referenceRange) return false;

    const value = obs.valueQuantity.value;
    const range = obs.referenceRange[0];
    const low = range.low?.value ?? -Infinity;
    const high = range.high?.value ?? Infinity;

    return value < low || value > high;
  });
}

module.exports = parseObservations;
