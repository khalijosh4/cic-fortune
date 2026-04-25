const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  res.status(statusCode).json({
    success: true,
    data,
    ...meta,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  });
};

const genId = (prefix) => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${num}`;
};

const genReceiptNo = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 90000) + 10000);
  return `RCP-${year}-${num}`;
};

module.exports = { sendSuccess, sendError, genId, genReceiptNo };
