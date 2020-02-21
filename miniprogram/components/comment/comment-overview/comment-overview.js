Component({
  data: {},
  properties: {
    comment: Object,
    momentId: String
  },
  methods: {
    handleLinkMore() {
      const {
        comment: { _id },
        momentId
      } = this.properties;
      wx.navigateTo({
        url: `../comment-detail/comment-detail?momentId=${momentId}&commentId=${_id}`
      });
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
