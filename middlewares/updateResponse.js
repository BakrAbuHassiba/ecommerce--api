const sendUpdatedDocResponse = (req, res) => {
  res.status(200).json({ data: res.locals.updatedDocument });
};

module.exports = {
  sendUpdatedDocResponse,
};
