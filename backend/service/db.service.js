require('console-stamp')(console, {
  pattern: 'dd/mm/yyyy HH:MM:ss.l'
});
const NODE_STATE = require('../state/node.state');

class DbService {
  constructor() {
    const sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database(__dirname + '/../db');
  }

  createTables() {
    const db = this.db;
    db.serialize(() => {
      db.run(
        'CREATE TABLE IF NOT EXISTS neighbor (' +
          'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,' +
          'address TEXT,' +
          'numberOfAllTransactions INTEGER,' +
          'numberOfRandomTransactionRequests INTEGER,' +
          'numberOfNewTransactions INTEGER,' +
          'numberOfInvalidTransactions INTEGER,' +
          'numberOfSentTransactions INTEGER,' +
          'connectionType TEXT' +
          ')'
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS host_node (
        id INTEGER PRIMARY KEY,
        protocol TEXT,
        ip TEXT,
        port TEXT,
        hashed_pw TEXT,
        iri_path TEXT,
        login_token TEXT,
        restart_node_command TEXT
      )`
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS neighbor_data (
        address TEXT PRIMARY KEY,
        name TEXT,
        port INTEGER
      )`
      );

      db.run(`CREATE TABLE IF NOT EXISTS notification (token TEXT)`);
    });
  }

  intitializeNeighborUsernname(fullAddress, name) {
    const currentAdditionalData = NODE_STATE.neighborAdditionalData.get(
      fullAddress
    );
    NODE_STATE.neighborAdditionalData.set(fullAddress, {
      name,
      port:
        currentAdditionalData && currentAdditionalData.port
          ? currentAdditionalData.port
          : null
    });
  }

  intitializeNeighborIriMainPort(fullAddress, port) {
    const currentAdditionalData = NODE_STATE.neighborAdditionalData.get(
      fullAddress
    );
    NODE_STATE.neighborAdditionalData.set(fullAddress, {
      name:
        currentAdditionalData && currentAdditionalData.name
          ? currentAdditionalData.name
          : null,
      port
    });
  }

  initializeState() {
    const sql = 'select * from host_node';
    this.db.get(sql, [], (err, row) => {
      NODE_STATE.protocol = row ? row.protocol : null;
      NODE_STATE.iriIp = row ? row.ip : null;
      NODE_STATE.iriPort = row ? row.port : null;
      NODE_STATE.hashedPw = row ? row.hashed_pw : null;
      NODE_STATE.loginToken = row ? row.login_token : null;
      NODE_STATE.iriFileLocation = row ? row.iri_path : null;
      NODE_STATE.restartNodeCommand = row ? row.restart_node_command : null;
    });

    this.db.all('select * from neighbor_data', [], (err, rows) => {
      rows.forEach(r => {
        this.intitializeNeighborUsernname(r.address, r.name ? r.name : null);
        this.intitializeNeighborIriMainPort(r.address, r.port ? r.port : null);
      });
    });
    this.db.all('select * from notification', [], (err, rows) => {
      rows.forEach(r => {
        NODE_STATE.notificationTokens.push(r.token);
      });
    });
  }

  dropAllTables() {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.run('drop table IF EXISTS neighbor', err => {
        if (err) {
          console.log('Error deleting neighbor table', err.message);
          reject();
          return;
        }
        db.run('drop table IF EXISTS host_node', err => {
          if (err) {
            console.log('Error deleting host_node table', err.message);
            reject();
            return;
          }
          db.run('drop table IF EXISTS neighbor_data', err => {
            if (err) {
              console.log('Error deleting host_node table', err.message);
              reject();
              return;
            }
            db.run('drop table IF EXISTS notification', err => {
              if (err) {
                console.log('Error deleting notification table', err.message);
                reject();
                return;
              }
              resolve();
            });
          });
        });
      });
    });
  }

  updateHostIp() {
    const updateHostIp = this.db.prepare(
      `UPDATE host_node SET login_token = ? WHERE id = ?`
    );
    updateHostIp.run(NODE_STATE.loginToken, 0);
  }

  setNotificationToken() {
    const stmt = this.db.prepare('INSERT INTO notification (token) VALUES (?)');
    stmt.run(NODE_STATE.token);
  }

  deleteNeighborHistory(fullAddress) {
    const removeNeighborEntriesWithAddress = this.db.prepare(
      `DELETE FROM neighbor where address=?`
    );
    removeNeighborEntriesWithAddress.run(fullAddress);
  }

  deleteNeighborData(fullAddress) {
    const removeNeighborEntriesWithAddress = this.db.prepare(
      'DELETE FROM neighbor_data where address=?'
    );
    removeNeighborEntriesWithAddress.run(fullAddress);
  }

  setNeighborAdditionalData(fullAddress, name, port) {
    const stmt = this.db.prepare(
      'REPLACE INTO neighbor_data (address, name, port) VALUES (?, ?, ?)'
    );
    stmt.run(fullAddress, name, port);
  }

  deleteWholeNeighborHistory() {
    this.db.run(`DELETE FROM neighbor`);
  }

  setupHost(
    protocol,
    iriIp,
    iriPort,
    hashedPw,
    iriFileLocation,
    loginToken,
    restartNodeCommand
  ) {
    const updateHostIp = this.db.prepare(
      'REPLACE INTO host_node (id, protocol, ip, port, hashed_pw, iri_path, login_token, restart_node_command) VALUES(?, ?, ?, ?, ?, ?, ?, ?)'
    );
    updateHostIp.run(
      0,
      protocol,
      iriIp,
      iriPort,
      hashedPw,
      iriFileLocation,
      loginToken,
      restartNodeCommand
    );
  }

  changeHostAddress(protocol, iriIp, iriPort) {
    const updateHostIp = this.db.prepare(
      `UPDATE host_node SET protocol = ?, ip = ?, port = ? WHERE id = ?`
    );
    updateHostIp.run(protocol, iriIp, iriPort, 0);
  }

  async getAllNeighborEntries() {
    return await new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM neighbor ORDER BY timestamp ASC',
        [],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }
}

const dbService = new DbService();
module.exports = dbService;