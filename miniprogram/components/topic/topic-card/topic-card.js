import formatTime from '../../../utils/formatTime'

Component({
  data: {
    title: "",
    icon: "",
    color: "",
    createTime: ''
  },
  properties: {
    topic: Object
  },
  options: {
    styleIsolation: "apply-shared"
  },
  observers: {
    ["topic.title"](title) {
      if (title.length > 10) {
        this.setData({
          title: `${title.slice(0, 10)}...`
        });
      } else {
        this.setData({ title });
      }
    },
    ["topic.type"](type) {
      let icon = "";
      let color = "";
      switch (type) {
        case "KNOWLEDGE":
          icon = "zhishicopy";
          color = "#663300";
          break;
        case "STORY":
          icon = "movie";
          color = "#4CB4E7";
          break;
        default:
          break;
      }
      this.setData({
        icon,
        color
      });
    },
    ["topic.createTime"](time) {
      if (time) {
        this.setData({
          createTime: formatTime(new Date(time))
        });
      }
    },
  },
  methods: {}
});
