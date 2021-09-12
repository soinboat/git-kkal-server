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

const addColorProperty = (position) => {
  const color = GRAPH_COLOR_LIST[position % GRAPH_COLOR_LIST.length];
  return color;
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
      let { nextPipeLineIndex } = acc;
      const { head, parents } = log;

      const [activatedPipeList, activatedPipeRootList] = deleteDeactivatedPipe(
        acc.activatedPipeList,
        acc.activatedPipeRootList,
        log
      );

      if (head) {
        const newPosition = nextPipeLineIndex;
        activatedPipeList[activatedPipeList.length] = newPosition;
        nextPipeLineIndex += 1;
        clonedNodeData[index] = {
          position: activatedPipeList.findIndex(
            (activatedPipe) => activatedPipe === newPosition
          ),
          ...clonedLogList[index],
        };
      }

      const samePipeParentIndex = clonedLogList.findIndex(
        (targetLog) => targetLog.hash === parents[0]
      );

      const otherPipeParentIndex = clonedLogList.findIndex(
        (targetLog) => targetLog.hash === parents[1]
      );

      if (parents.length === 1) {
        if (!clonedNodeData[samePipeParentIndex]) {
          clonedNodeData[samePipeParentIndex] = {
            position: clonedNodeData[index].position,
            ...clonedLogList[samePipeParentIndex],
          };
        } else {
          const targetIndex = activatedPipeRootList.findIndex(
            (target) => target.newPipeRootHash === parents[0]
          );

          if (targetIndex < 0) {
            activatedPipeRootList.push({
              newPipeRootHash: parents[0],
              connectedPipe: [
                Math.max(
                  clonedNodeData[index].position,
                  clonedNodeData[samePipeParentIndex].position
                ),
              ],
              index,
            });
          } else {
            activatedPipeRootList[targetIndex].connectedPipe.push(
              clonedNodeData[index].position
            );
          }
          clonedNodeData[samePipeParentIndex].position = Math.min(
            clonedNodeData[samePipeParentIndex].position,
            clonedNodeData[index].position
          );
        }
      } else if (parents.length === 2) {
        if (!clonedNodeData[samePipeParentIndex]) {
          clonedNodeData[samePipeParentIndex] = {
            position: clonedNodeData[index].position,
            ...clonedLogList[samePipeParentIndex],
          };
        } else {
          clonedNodeData[samePipeParentIndex].position = Math.min(
            clonedNodeData[samePipeParentIndex].position,
            clonedNodeData[index].position
          );
        }

        if (!clonedNodeData[otherPipeParentIndex]) {
          const newPosition = nextPipeLineIndex;
          nextPipeLineIndex += 1;
          activatedPipeList[activatedPipeList.length] = newPosition;
          clonedNodeData[otherPipeParentIndex] = {
            position: activatedPipeList[activatedPipeList.length - 1],
            ...clonedLogList[otherPipeParentIndex],
          };
        }
      }

      clonedNodeData[index].color = addColorProperty(
        clonedNodeData[index].position
      );
      clonedNodeData[index].position = activatedPipeList.findIndex(
        (number) => number === clonedNodeData[index].position
      );
      return {
        clonedNodeData,
        activatedPipeList,
        activatedPipeRootList,
        nextPipeLineIndex,
      };
    },
    {
      clonedNodeData: [],
      activatedPipeList: initialActivatedPipeList,
      activatedPipeRootList: initialActivatedPipeRootList,
      nextPipeLineIndex: 1,
    }
  );

  return modifiedGraphData.clonedNodeData;
};

const graphDataGenerator = (logListData) => {
  const logList = addHeadProperty(logListData).map((log, index) => {
    const logClone = { ...log };
    logClone.index = index;
    return logClone;
  });
  const initialActivatedPipeList = [0];
  const initialActivatedPipeRootList = [];

  const nodeList = new Array(logList.length);

  const graphData = addPositionProperty(
    logList,
    nodeList,
    initialActivatedPipeList,
    initialActivatedPipeRootList
  );

  return graphData;
};

module.exports = graphDataGenerator;
