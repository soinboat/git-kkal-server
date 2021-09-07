const GRAPH_COLOR_LIST = require('../constants/graphColorPalette');

const deleteDeactivatedPipe = (
  activatedPipeList,
  activatedPipeRootList,
  log
) => {
  let clonedActivatedPipeList = [...activatedPipeList];
  const clonedActivatedPipeRootList = [...activatedPipeRootList];

  const newPipeRootIndex = clonedActivatedPipeRootList.findIndex(
    (branchPoint) => branchPoint.newPipeRootHash === log.hash
  );

  if (newPipeRootIndex !== -1) {
    const pipeListToBeRemoved =
      clonedActivatedPipeRootList[newPipeRootIndex].connectedPipe;

    pipeListToBeRemoved.forEach((pipeToBeRemoved) => {
      clonedActivatedPipeList = clonedActivatedPipeList.filter(
        (branchPosition) => branchPosition !== pipeToBeRemoved
      );
    });

    clonedActivatedPipeRootList.splice(newPipeRootIndex, 1);
  }

  return [clonedActivatedPipeList, clonedActivatedPipeRootList];
};

const addHeadProperty = (logListData) => {
  const logList = logListData.map((log) => {
    const { hash, branchName1: branch, parents } = log;
    const newLog = {
      ...log,
      head: false,
      parents: parents.split(' '),
    };

    if (branch.length) {
      for (let i = 0; i < logListData.length; i += 1) {
        if (logListData[i].parents.includes(hash)) {
          return newLog;
        }
      }

      return {
        ...newLog,
        head: true,
      };
    }

    return newLog;
  });

  logList[logList.length - 1].parents = [];

  return logList;
};

const addPositionProperty = (
  logList,
  nodeList,
  initialActivatedPipeList,
  initialActivatedPipeRootList
) => {
  const modifiedGraphData = logList.reduce(
    (acc, log, index, clonedLogList) => {
      const { clonedNodeData } = acc;
      const { head, parents } = log;

      if (!parents.length) {
        return clonedNodeData;
      }

      const [activatedPipeList, activatedPipeRootList] = deleteDeactivatedPipe(
        acc.activatedPipeList,
        acc.activatedPipeRootList,
        log
      );

      if (head) {
        const newPosition = activatedPipeList.length;
        activatedPipeList[activatedPipeList.length] = newPosition;
        clonedNodeData[index] = {
          position: newPosition,
          ...clonedLogList[index],
        };
      }

      const sameBranchParentIndex = clonedLogList.findIndex(
        (targetLog) => targetLog.hash === parents[0]
      );

      const otherBranchParentIndex = clonedLogList.findIndex(
        (targetLog) => targetLog.hash === parents[1]
      );

      if (parents.length === 1) {
        if (!clonedNodeData[sameBranchParentIndex]) {
          clonedNodeData[sameBranchParentIndex] = {
            position: clonedNodeData[index].position,
            ...clonedLogList[sameBranchParentIndex],
          };
        } else {
          clonedNodeData[sameBranchParentIndex].position = Math.min(
            clonedNodeData[sameBranchParentIndex].position,
            clonedNodeData[index].position
          );

          const targetIndex = activatedPipeRootList.findIndex(
            (target) => target.newPipeRootHash === parents[0]
          );

          if (targetIndex < 0) {
            activatedPipeRootList.push({
              newPipeRootHash: parents[0],
              connectedPipe: [clonedNodeData[index]?.position],
            });
          } else {
            activatedPipeRootList[targetIndex].connectedPipe.push(
              clonedNodeData[index].position
            );
          }
        }
      } else if (parents.length === 2) {
        if (!clonedNodeData[sameBranchParentIndex]) {
          clonedNodeData[sameBranchParentIndex] = {
            position: clonedNodeData[index].position,
            ...clonedLogList[sameBranchParentIndex],
          };
        } else {
          clonedNodeData[sameBranchParentIndex].position = Math.min(
            clonedNodeData[sameBranchParentIndex].position,
            clonedNodeData[index].position
          );
        }

        if (!clonedNodeData[otherBranchParentIndex]) {
          const newPosition = activatedPipeList.length;
          activatedPipeList[activatedPipeList.length] = newPosition;
          clonedNodeData[otherBranchParentIndex] = {
            position: activatedPipeList[activatedPipeList.length - 1],
            ...clonedLogList[otherBranchParentIndex],
          };
        }
      }

      return { clonedNodeData, activatedPipeList, activatedPipeRootList };
    },
    {
      clonedNodeData: nodeList,
      activatedPipeList: initialActivatedPipeList,
      activatedPipeRootList: initialActivatedPipeRootList,
    }
  );

  return modifiedGraphData;
};

const addColorProperty = (graphData) => {
  const modifiedGraphData = graphData.map((graphDataWithPosition) => {
    const newGraphDataWithColor = graphDataWithPosition;
    newGraphDataWithColor.color =
      GRAPH_COLOR_LIST[
        newGraphDataWithColor.position % GRAPH_COLOR_LIST.length
      ];
    return newGraphDataWithColor;
  });

  return modifiedGraphData;
};

const graphDataGenerator = (logListData) => {
  const logList = addHeadProperty(logListData);
  const initialActivatedPipeList = [0];
  const initialActivatedPipeRootList = [];

  const nodeList = new Array(logList.length);

  const graphData = addPositionProperty(
    logList,
    nodeList,
    initialActivatedPipeList,
    initialActivatedPipeRootList
  );

  const modifiedGraphData = addColorProperty(graphData);

  return modifiedGraphData;
};

module.exports = graphDataGenerator;
