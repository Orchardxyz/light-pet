import formatTime from "../../../utils/formatTime";
import getIconStyle from "../../../utils/topic/getIconStyle";

Component({
  data: {
    title: "",
    icon: "",
    color: "",
    createTime: ""
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
      const { icon, color } = getIconStyle(type);
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
    }
  },
  methods: {}
});
