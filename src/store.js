import firebase from 'firebase/app';
import 'firebase/messaging';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import axios from 'axios';

axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

axios.interceptors.response.use(
  response => response,
  error => {
    if (401 === error.response.status) {
      state.authenticated = false;
    } else {
      return Promise.reject(error);
    }
  }
);

let timer = undefined;

const state = {
  hostNode: null,
  iriFileLocation: null,
  restartNodeCommandAvailable: null,
  token: null,
  loading: false,
  nodeInfo: null,
  iriIp: null,
  neighbors: null,
  nodeError: null,
  authenticated: null,
  password: null,
  persistedNeighbors: null,
  inschpektorVersions: null,
  systemInfo_cpu: [],
  systemInfo_runningProcesses: [],
  systemInfo_diskIO: [],
  systemInfo_networkIO: [],
  currentCpuUsage: 0,
  currentUpload: 0,
  currentDownload: 0,
  currentDiskIO: 0,
  currentRunningProcess: 0,
  userIsTyping: false
};

const mutations = {
  SET_TOKEN(state, token) {
    axios.defaults.headers.common['Authorization'] = token;
    localStorage.setItem('token', token);
    state.token = token;
  },
  SET_NODE_INFO(state, info) {
    state.nodeInfo = info;
  },
  SET_IRI_DETAILS(state, iriDetails) {
    state.iriIp = iriDetails.nodeIp;
    state.hostNode = iriDetails.nodeIp
      ? `${iriDetails.nodeIp}:${iriDetails.port}`
      : null;
    state.iriFileLocation = iriDetails.iriFileLocation;
    state.restartNodeCommandAvailable = iriDetails.restartNodeCommandAvailable;
  },
  SET_NEIGHBORS(state, neighbors) {
    if (!state.userIsTyping) {
      state.neighbors = neighbors;
    }
  },
  SET_SYSTEM_INFO(state, systemInfo) {
    if (!systemInfo.length) {
      state.systemInfo_cpu = null;
      state.systemInfo_runningProcesses = null;
      state.systemInfo_diskIO = null;
      state.systemInfo_networkIO = null;
      return;
    }

    state.currentCpuUsage = systemInfo[0].cpuLoad;
    state.systemInfo_cpu = [
      {
        data:
          systemInfo.length >= 100
            ? systemInfo.map(info => info.cpuLoad).reverse()
            : systemInfo
                .map(info => Number(info.cpuLoad))
                .concat(new Array(100 - systemInfo.length).fill(0))
                .reverse(),
        smooth: true,
        fill: true
      }
    ];

    state.currentUpload = systemInfo[0].networkIO.upload;
    state.currentDownload = systemInfo[0].networkIO.download;
    state.systemInfo_networkIO = [
      {
        data:
          systemInfo.length >= 100
            ? systemInfo.map(info => info.networkIO.upload).reverse()
            : systemInfo
                .map(info => info.networkIO.upload)
                .concat(new Array(100 - systemInfo.length).fill(0))
                .reverse(),
        smooth: true,
        fill: true
      },
      {
        data:
          systemInfo.length >= 100
            ? systemInfo.map(info => info.networkIO.download).reverse()
            : systemInfo
                .map(info => info.networkIO.download)
                .concat(new Array(100 - systemInfo.length).fill(0))
                .reverse(),
        smooth: true,
        fill: true
      }
    ];

    state.currentDiskIO = systemInfo[0].diskIO;
    state.systemInfo_diskIO = [
      {
        data:
          systemInfo.length >= 100
            ? systemInfo.map(info => info.diskIO).reverse()
            : systemInfo
                .map(info => Number(info.diskIO))
                .concat(new Array(100 - systemInfo.length).fill(0))
                .reverse(),
        smooth: true,
        fill: true
      }
    ];

    state.currentRunningProcess = systemInfo[0].runningProcesses;
    state.systemInfo_runningProcesses = [
      {
        data:
          systemInfo.length >= 100
            ? systemInfo.map(info => info.runningProcesses).reverse()
            : systemInfo
                .map(info => Number(info.runningProcesses))
                .concat(new Array(100 - systemInfo.length).fill(0))
                .reverse(),
        smooth: true,
        fill: true
      }
    ];
  },
  SET_ERROR(state, nodeError) {
    state.nodeError = nodeError;
  },
  SET_PASSWORD(state, password) {
    state.password = password;
  },
  USER_AUTHENTICATED(state, authenticated) {
    state.authenticated = authenticated;
  },
  SET_PERSISTED_IRI_NEIGHBORS(state, persistedNeighbors) {
    state.persistedNeighbors = persistedNeighbors;
  },
  DELETE_STATE(state) {
    Object.entries(state).forEach(([key, value]) => (state[key] = null));
  },
  SET_INSCHPEKTOR_LATEST_VERSION(state, versions) {
    state.inschpektorVersions = versions;
  },
  USER_IS_TYPING(state) {
    state.userIsTyping = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.userIsTyping = false;
    }, 15000);
  }
};

const actions = {
  login({ commit, dispatch }, passwordOrToken) {
    if (!passwordOrToken) passwordOrToken = localStorage.getItem('token');
    if (!passwordOrToken) return;
    return axios
      .post('/api/login', { passwordOrToken })
      .then(response => {
        commit('SET_TOKEN', response.data.token);
        commit('USER_AUTHENTICATED', true);
        dispatch('checkForVersionUpdate');
      })
      .catch(error => {
        commit('USER_AUTHENTICATED', false);
        console.log('Unsuccessful login attempt.', error.message);
      });
  },
  fetchNodeInfo({ commit }) {
    axios('/api/node-info')
      .then(response => {
        commit('SET_NODE_INFO', response.data);
        commit('SET_ERROR', null);
      })
      .catch(error => {
        commit('SET_NODE_INFO', null);
        commit('SET_ERROR', error.response.data);
      });
  },
  fetchIriDetails({ commit }) {
    axios('/api/iri-details')
      .then(response => {
        commit('SET_IRI_DETAILS', response.data);
      })
      .catch(error => {
        console.log('Error fetching iri details.');
      });
  },
  fetchNeighbors({ commit }) {
    axios('/api/neighbors')
      .then(response => {
        commit('SET_NEIGHBORS', response.data);
      })
      .catch(error => {
        commit('SET_ERROR', error.response.data);
      });
  },
  fetchSystemInfo({ commit }) {
    axios('/api/system-info')
      .then(response => {
        commit('SET_SYSTEM_INFO', response.data);
      })
      .catch(error => {
        console.log('Error fetching system info.');
      });
  },
  setHostNodeIp({ dispatch, commit }, nodeSubmission) {
    let protocol = nodeSubmission.isHttps ? 'https' : 'http';
    let nodeIp = nodeSubmission.nodeIp;
    let port = '14265';
    if (nodeIp.includes(':')) {
      port = nodeIp.substring(nodeIp.indexOf(':') + 1);
      nodeIp = nodeIp.substring(0, nodeIp.indexOf(':'));
    }
    axios
      .post('/api/host-node-ip', {
        protocol,
        nodeIp,
        port,
        password: nodeSubmission.password,
        iriPath: nodeSubmission.iriFileLocation,
        restartNodeCommand: nodeSubmission.restartNodeCommand
      })
      .then(response => {
        state.iriIp = nodeIp;
        state.iriPort = port;
        if (response.data.token) {
          commit('SET_TOKEN', response.data.token);
          commit('USER_AUTHENTICATED', true);
          commit('SET_IRI_DETAILS', nodeSubmission);
        } else {
          commit('USER_AUTHENTICATED', false);
        }
        commit('SET_ERROR', null);
        dispatch('fetchNeighbors');
        dispatch('fetchNodeInfo');
      })
      .catch(error => console.log('error setting node ip', error));
  },
  addNeighbor({ dispatch, commit }, neighborSubmission) {
    axios
      .post('/api/neighbor', {
        name: neighborSubmission.name,
        domain: neighborSubmission.address,
        writeToIriConfig: neighborSubmission.writeToIriConfig,
        port: neighborSubmission.port // iri main port, not connection port
      })
      .then(response => {
        dispatch('fetchNeighbors');
      })
      .catch(error => console.log('Error adding neighbor'));
  },
  setNeighborName({ commit }, neighbor) {
    commit('USER_IS_TYPING');
    axios
      .post('/api/neighbor/name', {
        name: neighbor.name,
        domainWithConnectionPort: `${neighbor.domain}:${
          neighbor.address.split(':')[1]
        }`
      })
      .then(response => {})
      .catch(error => console.log('Error when setting nick for neighbor'));
  },
  setNeighborPort({ commit }, neighbor) {
    commit('USER_IS_TYPING');
    axios
      .post('/api/neighbor/port', {
        iriPort: neighbor.port,
        domainWithConnectionPort: `${neighbor.domain}:${
          neighbor.address.split(':')[1]
        }`
      })
      .then(response => {})
      .catch(error => console.log('Error when setting port for neighbor'));
  },
  removeNeighbor({ dispatch, commit }, { domain, address }) {
    axios
      .delete('/api/neighbor', {
        data: { domainWithConnectionPort: `${domain}:${address.split(':')[1]}` }
      })
      .then(response => {
        dispatch('fetchNeighbors');
      })
      .catch(error => console.log('Error deleting neighbor'));
  },
  fetchPersistedIriNeighbors({ commit }) {
    axios('/api/persisted-neighbors')
      .then(response => {
        commit('SET_PERSISTED_IRI_NEIGHBORS', response.data);
      })
      .catch(error => {
        console.log('Error fetching persisted iri neighbors');
      });
  },
  resetDatabase({ commit }) {
    return axios
      .post('/api/reset-database')
      .then(response => {
        commit('USER_AUTHENTICATED', false);
        commit('SET_ERROR', 'NODE_NOT_SET');
        commit('DELETE_STATE');
      })
      .catch(error => console.log('Unsuccessful reset-database attempt.'));
  },
  restartNode({ commit }) {
    return axios
      .post('/api/restart-node')
      .catch(error => console.log('Unsuccessful restart-node attempt.'));
  },
  loadPeriodically({ dispatch }) {
    dispatch('fetchNeighbors');
    dispatch('fetchNodeInfo');
    dispatch('fetchSystemInfo');
  },
  saveDatabase({ commit }) {
    const neighborsToBackup = JSON.stringify(state.neighbors);
    const blob = new Blob([neighborsToBackup], { type: 'text/json' });
    const fileName = 'inschpektor-backup.json';

    const tempElement = document.createElement('a');
    const url = URL.createObjectURL(blob);
    tempElement.href = url;
    tempElement.download = fileName;
    document.body.appendChild(tempElement);
    tempElement.click();

    setTimeout(function() {
      document.body.removeChild(tempElement);
      window.URL.revokeObjectURL(url);
    });
  },
  loadDatabase({ commit }, restoredNeighbors) {
    axios
      .post('/api/neighbor/additional-data', restoredNeighbors)
      .catch(error =>
        console.log('Error when trying to restore neighbor additional data.')
      );
  },
  checkForVersionUpdate({ commit }) {
    axios
      .get('/api/versions')
      .then(response => {
        if (response && response.data) {
          commit('SET_INSCHPEKTOR_LATEST_VERSION', response.data);
        }
      })
      .catch(error =>
        console.log(
          'Could not receive information about latest inschpektor version.'
        )
      );
  },
  async enableNotifications({ commit }) {
    try {
      const messaging = firebase.messaging();
      await messaging.requestPermission();
      const token = await messaging.getToken();

      axios
        .post('/api/notification', { token })
        .catch(error =>
          console.log('Error when sending notification permission token.')
        );
    } catch (error) {
      console.log('Failed to request notification permissions.');
    }
  }
};

const getters = {
  token: state => state.token,
  loading: state => state.loading,
  nodeInfo: state => state.nodeInfo,
  iriFileLocation: state => state.iriFileLocation,
  restartNodeCommandAvailable: state => state.restartNodeCommandAvailable,
  iriIp: state => state.iriIp,
  hostNode: state => state.hostNode,
  neighbors: state => state.neighbors,
  nodeError: state => state.nodeError,
  authenticated: state => state.authenticated,
  persistedNeighbors: state => state.persistedNeighbors,
  inschpektorVersions: state => state.inschpektorVersions,
  systemInfo_cpu: state => state.systemInfo_cpu,
  systemInfo_runningProcesses: state => state.systemInfo_runningProcesses,
  systemInfo_diskIO: state => state.systemInfo_diskIO,
  systemInfo_networkIO: state => state.systemInfo_networkIO,
  currentCpuUsage: state => state.currentCpuUsage,
  currentUpload: state => state.currentUpload,
  currentDownload: state => state.currentDownload,
  currentDiskIO: state => state.currentDiskIO,
  currentRunningProcess: state => state.currentRunningProcess,
  userIsTyping: state => state.userIsTyping
};

const storeModule = {
  state,
  mutations,
  actions,
  getters
};

export default new Vuex.Store({
  modules: {
    storeModule
  }
});
