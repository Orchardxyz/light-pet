import formatTime from "../../../utils/formatTime";
import { FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";

const DEFAULT_PLACHOLDER = "请在此输入评论";
const DEFAULT_COMMENT = "";
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentId: "",
    moment: {},
    currentCommentId: "",
    likeCount: 0,
    commentCount: 0,
    firstComment: {},
    commentShow: false, // 评论弹框是否显示
    placeholderTxt: DEFAULT_PLACHOLDER, // 评论弹框中的默认文字
    defaultCommentValue: DEFAULT_COMMENT, // 评论框默认值
    isReply: false,
    commentLevel: 0,
    replyUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId = "" } = options;
    this._getMomentDetail(momentId);
  },

  // 加载动态详情
  _getMomentDetail(momentId) {
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          momentId,
          $url: "/moment/detail"
        }
      })
      .then(res => {
        const {
          result: {
            detail: { data: moment } = {},
            comment: { data: commentList } = []
          }
        } = res;
        const { likes = [], commentCount } = moment;
        const firstComment = commentList[0];
        firstComment.createTime = formatTime(new Date(firstComment.createTime));
        const { children = [] } = firstComment;

        this.setData({
          moment,
          momentId,
          commentCount,
          firstComment,
          likeCount: likes.length
        });

        wx.hideLoading();
      });
  },

  // 初始化数据
  _initData() {
    this.setData({
      currentCommentId: "",
      commentShow: false,
      placeholderTxt: DEFAULT_PLACHOLDER,
      defaultCommentValue: DEFAULT_COMMENT,
      isReply: false
    });
  },

  // 一级评论：对评论进行评论
  handleComment(event) {
    const {
      currentTarget: {
        dataset: { commentid, nickname }
      }
    } = event;
    this.setData({
      isReply: true,
      currentCommentId: commentid,
      placeholderTxt: `回复@${nickname}：`,
      commentShow: true,
      defaultCommentValue: "",
      commentLevel: FIRST_REPLY
    });
  },

  // 二级评论回复
  handleSecComment(event) {
    const {
      currentTarget: {
        dataset: { comment = {}, commentid }
      }
    } = event;
    const { _openid, avatarUrl, nickName } = comment;
    const replyUser = {
      _openid,
      avatarUrl,
      nickName
    };
    this.setData({
      replyUser,
      isReply: true,
      currentCommentId: commentid,
      placeholderTxt: `回复@${nickName}：`,
      commentShow: true,
      defaultCommentValue: "",
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
        name: "community",
        data: {
          reply,
          $url: "reply"
        }
      })
      .then(() => {
        wx.hideLoading();
        this._getMomentDetail(momentId);
        wx.showToast({
          title: "回复成功!"
        });
      });
  },

  // 进入评论详情页
  enterCommentDetail(event) {
    const { momentId } = this.data
    const { currentTarget: {dataset: {commentid}}} = event
    wx.navigateTo({
      url: `../comment-detail/comment-detail?momentId=${momentId}&commentId=${commentid}`
    });
  },

  // 进入评论列表页
  enterCommentList() {
    const { momentId } = this.data
    wx.navigateTo({
      url: `../comment-list/comment-list?momentId=${momentId}`
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
