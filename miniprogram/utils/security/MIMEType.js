module.exports = imgType => {
  switch (imgType) {
    case ".jpg" || ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "";
  }
};
