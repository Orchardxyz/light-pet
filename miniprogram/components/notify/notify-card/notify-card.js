import {
  GIVE_LIKE,
  COMMENT,
  REPLY,
  STAR_MOMENT
} from "../../../utils/notify/notifyAction";

let url = "";

Component({
  data: {
    notify_text: ""
  },
  properties: {
    notification: Object
  },
  observers: {
    notification(obj) {
      let notify_text = "";
      const { action, source_id } = obj;
      switch (action) {
        case GIVE_LIKE:
          notify_text = "赞了你";
          url = `/pages/moment/moment-detail/moment-detail?momentId=${source_id}`;
          break;
        case COMMENT:
          notify_text = "评论了你";
          url = `/pages/moment/moment-detail/moment-detail?momentId=${source_id}`;
          break;
        case REPLY:
          notify_text = "回复了你";
          url = `/pages/moment/comment-detail/comment-detail?commentId=${source_id}`;
          break;
        case STAR_MOMENT:
          notify_text = "收藏了你的内容";
          url = `/pages/moment/moment-detail/moment-detail?momentId=${source_id}`;
          break;
        default:
          notify_text = "";
      }
      this.setData({ notify_text });
    }
  },
  methods: {
    enterDetail() {
      wx.navigateTo({
        url
      });
    }
  }
});
