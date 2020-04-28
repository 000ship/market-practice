exports.getIndex = (req, res, next) => {
    res.status(200).json({ message: 'Posts fetched successfully.'});
  };