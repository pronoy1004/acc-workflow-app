const logLevel = process.env.LOG_LEVEL || 'info';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = logLevels[logLevel] || 2;

const logger = {
  error: (message, ...args) => {
    if (currentLevel >= 0) {
      console.error(`[ERROR] ${new Date().toISOString()}:`, message, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (currentLevel >= 1) {
      console.warn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
  },
  
  info: (message, ...args) => {
    if (currentLevel >= 2) {
      console.info(`[INFO] ${new Date().toISOString()}:`, message, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (currentLevel >= 3) {
      console.debug(`[DEBUG] ${new Date().toISOString()}:`, message, ...args);
    }
  }
};

module.exports = logger;
