import topicType from './topicType'
module.exports = type => {
  const { KNOWLEDGE, STORY, CUSTOM } = topicType
  let icon = "";
  let color = "";
  switch (type) {
    case KNOWLEDGE:
      icon = "zhishicopy";
      color = "#663300";
      break;
    case STORY:
      icon = "movie";
      color = "#4CB4E7";
      break;
    case CUSTOM:
      color = "#009A61";
      break;
    default:
      break;
  }

  return {
    icon,
    color
  };
};
