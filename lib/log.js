
function log(message, level) {
  level = level || 'info';
  if (!message || !level || typeof console[level] !== 'function') {
    return;
  }

  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  level === 'info' ? console[level]('%s', message) : console[level]('%s: %s', level, message);
}

module.exports = log;
