import { FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";
import msgCheck from "../../../utils/security/msgCheck";
import secWarn from "../../../utils/security/secWarn";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    topicId: "",
    comment: {},
    placeholderText: "",
    isReplyOpen: false,
    replyLevel: FIRST_REPLY,
    replyUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { topicId, commentId } = options;
    this.setData({
      topicId
    });
    this._loadCommentDetail(commentId);
  },

  _initData() {
    this.setData({
      placeholderText: "",
      isReplyOpen: false,
      replyLevel: FIRST_REPLY,
      replyUser: {}
    });
  },

  _loadCommentDetail(commentId) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "topic",
        data: {
          $url: "/comment/detail",
          commentId
        }
      })
      .then(res => {
        const { result: comment } = res;
        const { nickName } = comment;
        this._setPlaceholderText(nickName);
        this.setData({
          comment
        });
        wx.hideLoading();
      });
  },

  _setPlaceholderText(nickName) {
    this.setData({
      placeholderText: `回复@${nickName}：`
    });
  },

  handleReply(event) {
    const {
      detail: { nickName }
    } = event;
    this._setPlaceholderText(nickName);
    this.setData({
      isReplyOpen: true,
      replyLevel: FIRST_REPLY,
      replyUser: {}
    });
  },

  handleSecReply(event) {
    const {
      detail: { _openid, nickName, avatarUrl }
    } = event;
    const replyUser = {
      _openid,
      avatarUrl,
      nickName
    };
    this._setPlaceholderText(nickName);
    this.setData({
      isReplyOpen: true,
      replyLevel: SECOND_REPLY,
      replyUser
    });
  },

  onReply(event) {
    const { detail } = event;
    if (detail.trim() === "") {
      wx.showModal({
        title: "回复内容不能为空!"
      });
      return;
    }
    const {
      comment: { _id: commentId },
      topicId,
      replyLevel,
      replyUser
    } = this.data;
    wx.showLoading({
      title: "提交中"
    });
    if (msgCheck(detail)) {
      const userInfo = app.getUserInfo();
      const reply = {
        ...userInfo,
        replyUser,
        currentTopicId: topicId,
        currentCommentId: commentId,
        content: detail,
        type: replyLevel
      };
      wx.cloud
        .callFunction({
          name: "topic",
          data: {
            reply,
            $url: "reply"
          }
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({
            title: "回复成功!",
            icon: "success"
          });
          this._initData();
          this._loadCommentDetail(commentId);
        });
    } else {
      wx.hideLoading();
      secWarn("msg");
      return;
    }
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
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
