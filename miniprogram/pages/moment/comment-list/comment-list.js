import formatTime from "../../../utils/formatTime";
import {
  DEFAULT_PLACHOLDER,
  DEFAULT_COMMENT
} from "../../../utils/defaultValue";
import { COMMENT, FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentId: "",
    commentList: [],
    isReply: false,
    commentShow: false,
    placeholderTxt: DEFAULT_PLACHOLDER,
    defaultCommentValue: DEFAULT_COMMENT,
    currentCommentId: "", // 当前要评论的留言id
    replyUser: {},
    commentLevel: COMMENT
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId } = options;
    this._getCommentList(momentId);
    this.setData({
      momentId
    });
  },

  // 加载评论列表
  _getCommentList(momentId) {
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "comment",
        data: {
          momentId,
          $url: "list"
        }
      })
      .then(res => {
        const {
          result: { data: commentList = [] }
        } = res;
        // 格式化时间
        for (let i = 0; i < commentList.length; i++) {
          const { createTime } = commentList[i];
          commentList[i].createTime = formatTime(new Date(createTime));
          const { children = [] } = commentList[i];
          // 只展示两条以内的回复数据
          const length = children.length <= 2 ? children.length : 2;
          // 用来判断是否显示【查看更多】的字段
          const isAll = children.length <= 2 ? true : false;
          commentList[i].isAll = isAll;
          children.splice(length);
          for (let i = 0; i < length; i++) {
            const { createTime } = children[i];
            children[i].createTime = formatTime(new Date(createTime));
          }
        }
        this.setData({
          commentList
        });

        wx.hideLoading();
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
      commentLevel: COMMENT
    });
  },

  // 进入评论详情页
  enterCommentDetail(event) {
    const { detail } = event;
    const { momentId } = this.data;
    wx.navigateTo({
      url: `../comment-detail/comment-detail?momentId=${momentId}&commentId=${detail}`
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
        title: "评论内容不能为空!"
      });
      return;
    }
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
        this._getCommentList(momentId);
        this._initData();
        wx.showToast({
          title: "回复成功!"
        });
      });
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
    const {
      globalData: { userInfo }
    } = app;
    const { momentId } = this.data;
    const { avatarUrl, nickName } = userInfo;
    wx.showLoading({
      title: "评论发表中"
    });
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
