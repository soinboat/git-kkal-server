const lineDataGenerator = (logListData) => {
  const SLOPE = 20;
  const logListObject = {};
  logListData.forEach((log) => {
    logListObject[log.hash] = log;
  });

  const lineData = logListData
    .map((node, index) => {
      const from = [node.position, index];
      const rawLineData = node.parents.map((parent, _, parentsClone) => {
        const parentNode = logListObject[parent];
        const to = [parentNode.position, parentNode.index];
        const color =
          node.position > parentNode.position ? node.color : parentNode.color;
        const singleLineData = { color, points: [from] };
        if (parentNode.position > node.position) {
          const checkPoint = [to[0], from[1] + SLOPE];
          singleLineData.points.push(checkPoint);
        } else if (parentNode.position < node.position) {
          if (parentsClone.length === 1) {
            const checkPoint = [from[0], to[1] - SLOPE];
            singleLineData.points.push(checkPoint);
          } else {
            singleLineData.color =
              node.position < parentNode.position
                ? node.color
                : parentNode.color;
          }
        }
        singleLineData.points.push(to);
        return singleLineData;
      });
      return rawLineData;
    })
    .flat();

  return lineData;
};

module.exports = lineDataGenerator;
