import formatTime from "../../../utils/formatTime";
import {
  DEFAULT_PLACHOLDER,
  DEFAULT_COMMENT
} from "../../../utils/defaultValue";
import { COMMENT, FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";
import notify from "../../../utils/notify/notify";
import notifyAction from "../../../utils/notify/notifyAction";
import { COMMENT_REPLY } from "../../../utils/notify/notifyType";
import msgCheck from "../../../utils/security/msgCheck";
import secWarn from "../../../utils/security/secWarn";

const app = getApp();

let MAX_COUNT = 10;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentId: "",
    moment: {},
    currentComment: {},
    commentList: [],
    isReply: false,
    commentShow: false,
    placeholderTxt: DEFAULT_PLACHOLDER,
    defaultCommentValue: DEFAULT_COMMENT,
    currentCommentId: "", // 当前要评论的留言id
    replyUser: {},
    commentLevel: COMMENT,
    isAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId } = options;
    this._getCommentList(momentId);
    this._getMoment(momentId);
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

  // 加载评论列表
  _getCommentList(momentId, start = 0) {
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "comment",
        data: {
          momentId,
          start,
          $url: "list"
        }
      })
      .then(res => {
        const {
          result: { data = [] }
        } = res;
        // 格式化时间
        for (let i = 0; i < data.length; i++) {
          const { createTime } = data[i];
          data[i].createTime = formatTime(new Date(createTime));
          const { children = [] } = data[i];
          // 只展示两条以内的回复数据
          const length = children.length <= 2 ? children.length : 2;
          // 用来判断是否显示【查看更多】的字段
          const isAll = children.length <= 2 ? true : false;
          data[i].isAll = isAll;
          children.splice(length);
          for (let i = 0; i < length; i++) {
            const { createTime } = children[i];
            children[i].createTime = formatTime(new Date(createTime));
          }
        }
        const { commentList } = this.data;
        if (data.length > 0) {
          this.setData({
            [`commentList[${commentList.length}]`]: data
          });
        } else {
          this.setData({
            isAll: true
          });
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  // 初始化数据
  _initData() {
    this.setData({
      isReply: false,
      commentShow: false,
      placeholderTxt: DEFAULT_PLACHOLDER,
      defaultCommentValue: DEFAULT_COMMENT,
      currentCommentId: "", // 当前要评论的留言id
      replyUser: {},
      commentLevel: COMMENT,
      currentComment: {}
    });
  },

  handleReply(event) {
    const {
      detail: { commentId, comment }
    } = event;
    const { nickName, avatarUrl, _openid, type } = comment;
    const commentLevel = type === 0 ? FIRST_REPLY : SECOND_REPLY;
    const replyUser = type === 0 ? {} : { _openid, nickName, avatarUrl };
    this.setData({
      currentComment: comment,
      commentLevel,
      replyUser,
      currentCommentId: commentId,
      isReply: true,
      commentShow: true,
      placeholderTxt: `回复@${nickName}：`,
      defaultCommentValue: DEFAULT_COMMENT
    });
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

    const { momentId, currentCommentId, commentLevel, replyUser } = this.data;
    wx.showLoading({
      title: "发表中"
    });
    if (msgCheck(detail)) {
      const userInfo = app.getUserInfo();
      const reply = {
        ...userInfo,
        replyUser,
        currentMomentId: momentId,
        currentCommentId,
        content: detail,
        type: commentLevel
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
            const _img = img.length > 0 ? img[0] : "";
            const { currentComment } = this.data;
            const { content } = currentComment;
            notify(
              commentLevel === FIRST_REPLY
                ? currentComment._openid
                : replyUser._openid,
              commentLevel === FIRST_REPLY
                ? currentComment.nickName
                : replyUser.nickName,
              COMMENT_REPLY,
              notifyAction.REPLY,
              { momentId: _id, commentId: currentCommentId },
              content,
              _img,
              detail
            );
            this._initData();
            this._getCommentList(momentId);
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

  // 直接评论
  onComment(event) {
    const { detail } = event;
    if (detail.trim() === "") {
      wx.showModal({
        title: "评论内容不能为空!"
      });
      return;
    }
    wx.showLoading({
      title: "评论发表中"
    });
    if (msgCheck(detail)) {
      const userInfo = app.getUserInfo();
      const { momentId } = this.data;
      const { avatarUrl, nickName } = userInfo;
      const comment = {
        momentId,
        avatarUrl,
        nickName,
        content: detail,
        type: COMMENT
      };
      wx.cloud
        .callFunction({
          name: "comment",
          data: {
            $url: "add",
            comment
          }
        })
        .then(() => {
          wx.hideLoading();
          this._getCommentList(momentId);
          this._initData();
          wx.showToast({
            title: "发表成功!"
          });
          const {
            moment: { _openid, nickName: reciever_name, img = [], content }
          } = this.data;
          const _img = img.length > 0 ? img[0] : "";
          notify(
            _openid,
            reciever_name,
            COMMENT_REPLY,
            notifyAction.COMMENT,
            { momentId },
            content,
            _img,
            detail
          );
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
  onPullDownRefresh: function() {
    const { momentId } = this.data;
    this._getCommentList(momentId);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const { commentList, momentId, isAll } = this.data;
    if (!isAll) {
      this._getCommentList(momentId, commentList.length * MAX_COUNT);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
