const sendDeleteResponse = (req, res) => {
  res.status(204).json();
};

module.exports = {
  sendDeleteResponse,
};
