import formatTime from '../../../utils/formatTime'

Component({
  data: {
    createTime: '',
  },
  properties: {
    comment: Object,
    momentId: String
  },
  observers: {
    ['comment.createTime'](time) {
      if (time) {
        this.setData({
          createTime: formatTime(new Date(time))
        })
      }
    }
  },
  methods: {
    handleLinkMore() {
      const {
        comment: { _id },
        momentId
      } = this.properties;
      this.triggerEvent("onLinkMore", { momentId, commentId: _id });
    },

    handleReply(event) {
      const {
        currentTarget: {
          dataset: { comment, commentid: commentId }
        }
      } = event;
      this.triggerEvent("onReply", { comment, commentId });
    }
  }
});
