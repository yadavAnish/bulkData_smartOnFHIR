function findAbnormalLabs(observations) {
  return observations.filter(obs =>
    obs.interpretation?.some(i => ['H', 'L'].includes(i.coding?.[0]?.code))
  );
}

module.exports = findAbnormalLabs;
