module.exports = species => {
  switch (species) {
    case "cat":
      return "猫咪";
    case "dog":
      return "狗狗";
    default:
      return "";
  }
};
