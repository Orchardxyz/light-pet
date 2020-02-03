Component({
  data: {},
  properties: {
    comment: Object
  },
  methods: {
    handleLinkMore() {
      const {
        comment: { _id }
      } = this.properties;
      this.triggerEvent("onLinkMore", _id);
    },

    // 一级评论
    handleComment(event) {
      const {
        currentTarget: {
          dataset: { comment, commentid: commentId }
        }
      } = event;
      this.triggerEvent("onComment", {comment, commentId});
    }
  }
});
