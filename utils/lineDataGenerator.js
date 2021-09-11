const colorSelector = (myLog, parentLog) => {
  const color =
    myLog.position > parentLog.position ? myLog.color : parentLog.color;

  return color;
};

const lineDataGenerator = (logListData) => {
  const lineData = [];

  logListData.forEach((log, index) => {
    log.parents.forEach((parent) => {
      const parentIndex = logListData.findIndex(
        (targetLog) => targetLog.hash === parent
      );

      const parentLog = logListData[parentIndex];

      const color = colorSelector(log, parentLog);

      lineData.push({ start: index, to: parentIndex, color });
    });
  });

  return lineData;
};

module.exports = lineDataGenerator;
