import formatTime from "../../../utils/formatTime";
import {
  DEFAULT_PLACHOLDER,
  DEFAULT_COMMENT
} from "../../../utils/defaultValue";
import { FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    comment: {},
    isReply: false,
    currentCommentId: "",
    momentId: "",
    placeholderTxt: DEFAULT_PLACHOLDER,
    commentShow: false,
    defaultCommentValue: DEFAULT_COMMENT,
    commentLevel: 0,
    replyUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId, commentId } = options;
    this._getCommentDetail(commentId);
    this.setData({
      currentCommentId: commentId,
      momentId
    });
  },

  // 获取当前评论详情
  _getCommentDetail(commentId) {
    wx.showLoading({
      title: "评论加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "comment",
        data: {
          $url: "detail",
          commentId
        }
      })
      .then(res => {
        const {
          result: { data: comment }
        } = res;
        const { createTime, children = [] } = comment;
        comment.createTime = formatTime(new Date(createTime));
        for (let i = 0; i < children.length; i++) {
          const { createTime } = children[i];
          children[i].createTime = formatTime(new Date(createTime));
        }
        this.setData({ comment });
        wx.hideLoading();
      });
  },

  // 一级评论
  handleComment(event) {
    const {
      detail: { _id, nickName }
    } = event;
    this.setData({
      isReply: true,
      currentCommentId: _id,
      placeholderTxt: `回复@${nickName}：`,
      commentShow: true,
      defaultCommentValue: DEFAULT_COMMENT,
      commentLevel: FIRST_REPLY
    });
  },

  // 二级评论回复
  handleSecComment(event) {
    const {
      detail: { _openid, avatarUrl, nickName }
    } = event;
    const replyUser = {
      _openid,
      avatarUrl,
      nickName
    };
    this.setData({
      replyUser,
      isReply: true,
      placeholderTxt: `回复@${nickName}：`,
      commentShow: true,
      defaultCommentValue: DEFAULT_COMMENT,
      commentLevel: SECOND_REPLY
    });
  },

  // 回复
  onReply(event) {
    const { detail } = event;
    const { momentId, currentCommentId, commentLevel, replyUser } = this.data;
    wx.showLoading({
      title: "发表中"
    });
    const {
      globalData: { userInfo }
    } = app;
    const reply = {
      ...userInfo,
      replyUser,
      currentMomentId: momentId,
      currentCommentId,
      content: detail,
      type: commentLevel
    };
    wx.cloud
      .callFunction({
        name: "comment",
        data: {
          reply,
          $url: "reply"
        }
      })
      .then(() => {
        wx.hideLoading();
        this._getCommentDetail(currentCommentId);
        wx.showToast({
          title: "回复成功!"
        });
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
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
