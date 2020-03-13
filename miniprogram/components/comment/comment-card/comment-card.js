import formatTime from "../../../utils/formatTime";

Component({
  data: {
    createTime: ""
  },
  properties: {
    comment: Object,
    isChild: Boolean
  },
  observers: {
    ["comment.createTime"](time) {
      if (time) {
        this.setData({
          createTime: formatTime(new Date(time))
        });
      }
    }
  },
  methods: {
    handleComment() {
      const { comment } = this.properties;
      this.triggerEvent("onComment", comment);
    }
  }
});
