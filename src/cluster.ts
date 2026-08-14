import cluster from 'cluster';
import os from 'os';
import logger from './utils/logger.js';

export const startClusteredServer = (startWorkerFn: () => void): void => {
  const numCpus = os.cpus().length;

  // Check for primary process
  if (cluster.isPrimary) {
    logger.info(
      { primaryPid: process.pid, workerCount: numCpus },
      `Primary cluster process ${process.pid} is running. Forking ${numCpus} workers...`
    );

    for (let i = 0; i < numCpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(
        { workerPid: worker.process.pid, code, signal },
        `Worker process ${worker.process.pid} died. Forking replacement worker...`
      );
      cluster.fork();
    });
  } else {
    logger.info({ workerPid: process.pid }, `Worker process ${process.pid} started`);
    startWorkerFn();
  }
};

export default startClusteredServer;
