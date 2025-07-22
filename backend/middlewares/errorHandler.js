function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: true, message: err.message || 'Error interno del servidor' });
};

module.exports = errorHandler;