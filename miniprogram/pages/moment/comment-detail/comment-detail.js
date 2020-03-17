import {
  DEFAULT_PLACHOLDER,
  DEFAULT_COMMENT
} from "../../../utils/defaultValue";
import { FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";
import notify from "../../../utils/notify/notify";
import notifyAction from "../../../utils/notify/notifyAction";
import { COMMENT_REPLY } from "../../../utils/notify/notifyType";
import msgCheck from "../../../utils/security/msgCheck";
import secWarn from "../../../utils/security/secWarn";

const app = getApp();

let currentCommentId = "";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    comment: {},
    moment: {},
    momentId: "",
    isReplyOpen: false,
    placeholderText: DEFAULT_PLACHOLDER,
    defaultCommentValue: DEFAULT_COMMENT,
    replyLevel: FIRST_REPLY,
    replyUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId, commentId } = options;
    this._getMoment(momentId);
    this._getCommentDetail(commentId);
  },

  _getMoment(momentId) {
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          $url: "/moment/get",
          momentId
        }
      })
      .then(res => {
        const { result } = res;
        this.setData({
          momentId,
          moment: result
        });
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
        currentCommentId = commentId;
        this.setData({ comment });
        wx.hideLoading();
      });
  },

  // 数据初始化
  _initData() {
    this.setData({
      comment: {},
      isReply: false,
      placeholderTxt: DEFAULT_PLACHOLDER,
      commentShow: false,
      defaultCommentValue: DEFAULT_COMMENT,
      replyLevel: FIRST_REPLY,
      replyUser: {}
    });
  },

  _setPlaceholderText(nickName) {
    this.setData({
      placeholderText: `回复@${nickName}：`
    });
  },

  // 一级评论
  handleComment(event) {
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

  // 二级评论回复
  handleSecComment(event) {
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

  // 直接输入评论
  onComment(event) {
    this.setData({
      replyLevel: FIRST_REPLY
    });
    this.onReply(event);
  },

  // 回复
  onReply(event) {
    const { detail } = event;
    if (detail.trim() === "") {
      wx.showModal({
        title: "回复内容不能为空!"
      });
      return;
    }
    const { momentId, replyLevel, replyUser } = this.data;
    wx.showLoading({
      title: "提交中"
    });
    if (msgCheck(detail)) {
      const userInfo = app.getUserInfo();
      const reply = {
        ...userInfo,
        replyUser,
        currentMomentId: momentId,
        currentCommentId,
        content: detail,
        type: replyLevel
      };
      wx.cloud.callFunction({
        name: "comment",
        data: {
          reply,
          $url: "reply"
        },
        success: res => {
          const { result } = res;
          if (result.errMsg === "document.update:ok") {
            const {
              moment: { _id, img = [] }
            } = this.data;
            const { comment } = this.data;
            const { content } = comment;
            const _img = img.length > 0 ? img[0] : "";
            notify(
              replyLevel === FIRST_REPLY ? comment._openid : replyUser._openid,
              replyLevel === FIRST_REPLY
                ? comment.nickName
                : replyUser.nickName,
              COMMENT_REPLY,
              notifyAction.REPLY,
              { momentId: _id, commentId: currentCommentId },
              content,
              _img,
              detail
            );
            this._initData();
            this._getCommentDetail(currentCommentId);

            wx.hideLoading();
            wx.showToast({
              title: "回复成功!",
              icon: "success"
            });
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
