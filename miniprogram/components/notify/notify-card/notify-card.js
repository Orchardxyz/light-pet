import {
  GIVE_LIKE,
  COMMENT,
  REPLY,
  STAR_MOMENT,
  TOPIC_LIKE,
  TOPIC_COMMENT,
  TOPIC_REPLY
} from "../../../utils/notify/notifyAction";
import formatTime from "../../../utils/formatTime";

Component({
  data: {
    notify_text: "",
    url: "",
    createTime: ""
  },
  properties: {
    notification: Object
  },
  observers: {
    notification(obj) {
      let notify_text = "";
      let url = "";
      const { action, source_params, notify_content, createTime } = obj;
      const { momentId, topicId, commentId } = source_params;
      switch (action) {
        case GIVE_LIKE:
          notify_text = "赞了你";
          url = `/pages/moment/moment-detail/moment-detail?momentId=${momentId}`;
          break;
        case COMMENT:
          notify_text = `评论了你：${notify_content}`;
          url = `/pages/moment/moment-detail/moment-detail?momentId=${momentId}`;
          break;
        case REPLY:
          notify_text = `回复了你：${notify_content}`;
          url = `/pages/moment/comment-detail/comment-detail?momentId=${momentId}&commentId=${commentId}`;
          break;
        case STAR_MOMENT:
          notify_text = "收藏了你的内容";
          url = `/pages/moment/moment-detail/moment-detail?momentId=${momentId}`;
          break;
        case TOPIC_LIKE:
          notify_text = "赞了你的话题";
          url = `/pages/topic/topic-detail/topic-detail?topicId=${topicId}`;
          break;
        case TOPIC_COMMENT:
          notify_text = `评论了你：${notify_content}`;
          url = `/pages/topic/topic-detail/topic-detail?topicId=${topicId}`;
          break;
        case TOPIC_REPLY:
          notify_text = `回复了你：${notify_content}`;
          url = `/pages/topic/comment-detail/comment-detail?topicId=${topicId}&commentId=${commentId}`;
          break;
        default:
          notify_text = "";
          break;
      }
      this.setData({
        notify_text,
        url,
        createTime: formatTime(new Date(createTime))
      });
    }
  },
  methods: {
    enterDetail() {
      const { url } = this.data;
      wx.navigateTo({
        url
      });
    }
  }
});
