import formatTime from "../../../utils/formatTime";
import getIconStyle from "../../../utils/topic/getIconStyle";
import commentType from "../../../utils/commentType";
import msgCheck from "../../../utils/security/msgCheck";
import regeneratorRuntime from "../../../utils/runtime";

const app = getApp();

const MAX_COUNT = 10;

let replyContent = "";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    topic: {},
    icon: "",
    color: "",
    commentList: [],
    isAll: false,
    // 排序方式
    isAsc: true,
    // 回复
    currentComment: {},
    commentLevel: commentType.COMMENT,
    isReplyOpen: false,
    replyUser: {},
    wordNum: 0,
    MAX_REPLY_COUNT: 200,
    replyPlaceholder: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { topicId } = options;
    this._loadTopicDetail(topicId);
  },

  // 初始化数据
  _initData() {
    this.setData({
      commentList: []
    });
  },

  async _loadTopicDetail(topicId) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    const { result: topic } = await wx.cloud.callFunction({
      name: "topic",
      data: {
        $url: "detail",
        topicId
      }
    });
    const { result: commentList } = await wx.cloud.callFunction({
      name: "topic",
      data: {
        $url: "/comment/list",
        topicId,
        start: 0,
        count: MAX_COUNT
      }
    });
    const { title } = topic;
    wx.setNavigationBarTitle({ title });
    topic.createTime = formatTime(new Date(topic.createTime));
    const { icon, color } = getIconStyle(topic.type);
    if (commentList.length > 0) {
      this.setData({
        [`commentList[${this.data.commentList.length}]`]: commentList
      });
    } else {
      this.setData({
        isAll: true
      });
    }
    this.setData({
      topic,
      icon,
      color
    });
    wx.hideLoading();
  },

  _loadTopicComment(start = 0, sortType = "asc") {
    if (start === 0) {
      this._initData();
    }
    wx.showLoading({
      title: "稍等",
      mask: true
    });
    const {
      topic: { _id: topicId }
    } = this.data;
    wx.cloud
      .callFunction({
        name: "topic",
        data: {
          $url: "/comment/list",
          topicId,
          start,
          count: MAX_COUNT,
          sortType
        }
      })
      .then(res => {
        const { result: commentList } = res;
        if (commentList.length > 0) {
          this.setData({
            [`commentList[${this.data.commentList.length}]`]: commentList
          });
        } else {
          this.setData({
            isAll: true
          });
        }
        wx.hideLoading();
      });
  },

  // 点赞
  handleLike() {
    const {
      topic: { _id: topicId, isLike, likeCount = 0 }
    } = this.data;
    const url = isLike ? "unlike" : "like";
    const num = isLike ? -1 : 1;
    wx.cloud
      .callFunction({
        name: "topic",
        data: {
          $url: url,
          topicId
        }
      })
      .then(res => {
        const {
          result: { errMsg }
        } = res;
        if (errMsg === "document.update:ok") {
          this.setData({
            ["topic.isLike"]: !isLike,
            ["topic.likeCount"]: likeCount + num
          });
        }
      });
  },

  // 直接评论
  handleComment(event) {
    const { detail } = event;
    const {
      topic: { _id: topicId }
    } = this.data;
    wx.showLoading({
      title: "提交中",
      mask: true
    });
    const { avatarUrl, nickName } = app.getUserInfo();
    const comment = {
      avatarUrl,
      nickName,
      topicId,
      content: detail,
      type: commentType.COMMENT
    };
    wx.cloud
      .callFunction({
        name: "topic",
        data: {
          $url: "/comment/publish",
          comment
        }
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: "提交成功",
          icon: "success",
          duration: 1500
        });
        this.setData({
          isAsc: false
        });
        this._loadTopicComment(0, "desc");
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({
          title: "提交失败",
          icon: "warn",
          duration: 1500
        });
      });
  },

  // 更换排序方式
  changeSortType() {
    const { isAsc } = this.data;
    this.setData({
      isAsc: !isAsc
    });
    this._loadTopicComment(0, !isAsc ? "asc" : "desc");
  },

  // 回复
  handleReply(event) {
    const {
      detail: { comment }
    } = event;
    const { nickName, avatarUrl, _openid, type } = comment;
    const commentLevel =
      type === 0 ? commentType.FIRST_REPLY : commentType.SECOND_REPLY;
    const replyUser = type === 0 ? {} : { _openid, nickName, avatarUrl };
    this.setData({
      isReplyOpen: true,
      currentComment: comment,
      commentLevel,
      replyUser,
      replyPlaceholder: `回复@${nickName}：`
    });
  },

  // 关闭回复框
  closeReplyDialog() {
    this.setData({
      isReplyOpen: false
    });
  },

  // 监听回复输入事件
  handleReplyInput(event) {
    const {
      detail: { value }
    } = event;
    replyContent = value;
    this.setData({
      wordNum: value.length
    });
  },

  submitReply() {
    if (replyContent.trim() === "") {
      wx.showModal({
        title: "回复内容不能为空!"
      });
      return;
    }
    this.closeReplyDialog()
    const {
      topic: { _id: topicId },
      currentComment: { _id: commentId },
      commentLevel,
      replyUser
    } = this.data;
    wx.showLoading({
      title: "发表中"
    });
    if (msgCheck(replyContent)) {
      const userInfo = app.getUserInfo();
      const reply = {
        ...userInfo,
        replyUser,
        currentTopicId: topicId,
        currentCommentId: commentId,
        content: replyContent,
        type: commentLevel
      };
      wx.cloud.callFunction({
        name: "topic",
        data: {
          reply,
          $url: "reply"
        },
        success: res => {
          const { result } = res;
          if (result.errMsg === "document.update:ok") {
            // const {
            //   moment: { _id, img = [] }
            // } = this.data;
            // const _img = img.length > 0 ? img[0] : "";
            // const { currentComment } = this.data;
            // const { content } = currentComment;
            // notify(
            //   commentLevel === FIRST_REPLY
            //     ? currentComment._openid
            //     : replyUser._openid,
            //   commentLevel === FIRST_REPLY
            //     ? currentComment.nickName
            //     : replyUser.nickName,
            //   COMMENT_REPLY,
            //   notifyAction.REPLY,
            //   { momentId: _id, commentId: currentCommentId },
            //   content,
            //   _img,
            //   detail
            // );
            wx.hideLoading();
            wx.showToast({
              title: "回复成功!",
              icon: "success"
            });
            this.setData({
              isAsc: true
            });
            this._loadTopicComment(0);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: "操作失败!",
              icon: "warn"
            });
          }
        }
      });
    } else {
      wx.hideLoading();
      secWarn("msg");
      return;
    }
  },

  // 查看更多
  handleLinkMore(event) {
    const {
      detail: { commentId, momentId: topicId }
    } = event;
    wx.navigateTo({
      url: `../comment-detail/comment-detail?topicId=${topicId}&commentId=${commentId}`
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const { isAll, isAsc, commentList } = this.data;
    if (!isAll) {
      this._loadTopicComment(
        commentList.length * MAX_COUNT,
        isAsc ? "asc" : "desc"
      );
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
