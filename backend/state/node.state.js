class NodeState {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.currentOwnNodeInfo = undefined;
    this.persistedNeighbors = undefined;
    this.restartNodeCommand = undefined;

    this.loginToken = undefined;
    this.hashedPw = undefined;
    this.notificationTokens = new Set();
    this.neighborAdditionalData = new Map();

    this.protocol = undefined;
    this.iriIp = undefined;
    this.iriPort = undefined;
    this.iriFileLocation = undefined;

    this.currentNeighbors = undefined;

    this.systemInfo = [];
  }
}

const nodeState = new NodeState();
module.exports = nodeState;
