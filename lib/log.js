
function log(message, level) {
  level = level || 'info';
  if (!message || !level || typeof console[level] !== 'function') {
    return;
  }

  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  console[level]('%s: %s', level, message);
}

module.exports = log;
