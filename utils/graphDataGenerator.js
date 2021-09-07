const GRAPH_COLOR_LIST = require('../constants/graphColorPalette');

const getLogListWithHeadTag = (data) => {
  const logList = data.map((log) => {
    const { hash, branchName1: branch, parents } = log;
    const newLog = {
      ...log,
      head: false,
      parents: parents.split(' '),
    };

    if (branch.length) {
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].parents.includes(hash)) {
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

const graphDataGenerator = (data) => {
  const logList = getLogListWithHeadTag(data);
  const initialActivatedPipeList = [0];
  const initialActivatedPipeRootList = [];

  const nodeList = new Array(logList.length);

  const graphDataListWithPosition = logList.reduce(
    (acc, log, index, clonedLogList) => {
      const { clonedNodeData } = acc;
      const { head, parents } = log;

      // 부모가 없는 노드(initial commit)일 시 중단
      if (!parents.length) {
        return clonedNodeData;
      }

      // *
      // |\
      // | *
      // | |
      // | *
      // |/
      // *  <- 이렇게 합쳐지는 경우 이전에 생성(활성화)되어있던 파이프를 삭제
      const [activatedPipeList, activatedPipeRootList] = deleteDeactivatedPipe(
        acc.activatedPipeList,
        acc.activatedPipeRootList,
        log
      );

      //
      // * <- 위쪽에 더 이상 연결된 노드가 없는 노드가 생성되는 경우
      // |
      // |
      // *
      // |
      // |
      // *
      // 새로운 파이프라인 생성
      if (head) {
        const newPosition = activatedPipeList.length;
        activatedPipeList[activatedPipeList.length] = newPosition;
        clonedNodeData[index] = {
          position: newPosition,
          ...clonedLogList[index],
        };
      }

      //  왼쪽 부모 인덱스
      const sameBranchParentIndex = clonedLogList.findIndex(
        (targetLog) => targetLog.hash === parents[0]
      );
      // 오른쪽 부모의 인덱스
      const otherBranchParentIndex = clonedLogList.findIndex(
        (targetLog) => targetLog.hash === parents[1]
      );

      if (parents.length === 1) {
        // 부모가 하나인 경우
        if (!clonedNodeData[sameBranchParentIndex]) {
          // 부모의 노드에 이미 데이터가 있는 경우
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
        // 부모가 여럿(2)인 경우
        if (!clonedNodeData[sameBranchParentIndex]) {
          // 바로 같은 직선 아래에 있는 노드에 데이터가 없는 경우
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
          // 대각으로 아래에 있는 노드에 데이터가 없는 경우
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

  // color property 추가
  const graphDataWithColor = graphDataListWithPosition.map(
    (graphDataWithPosition) => {
      const newGraphDataWithColor = graphDataWithPosition;
      newGraphDataWithColor.color =
        GRAPH_COLOR_LIST[
          newGraphDataWithColor.position % GRAPH_COLOR_LIST.length
        ];
      return newGraphDataWithColor;
    }
  );

  return graphDataWithColor;
};

module.exports = graphDataGenerator;
