import formatTime from "../../../utils/formatTime";
import { COMMENT, FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";
import { LIKE, COMMENT_REPLY } from "../../../utils/notify/notifyType";
import notifyAction from "../../../utils/notify/notifyAction";
import notify from "../../../utils/notify/notify";

const DEFAULT_PLACHOLDER = "请在此输入评论";
const DEFAULT_COMMENT = "";
const app = getApp();
const fileManager = wx.getFileSystemManager();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentId: "",
    moment: {},
    isLike: false,
    currentCommentId: "",
    likeCount: 0,
    commentCount: 0,
    firstComment: {},
    isExpand: false, // 查看更多的按钮是否展开
    commentShow: false, // 评论弹框是否显示
    placeholderTxt: DEFAULT_PLACHOLDER, // 评论弹框中的默认文字
    defaultCommentValue: DEFAULT_COMMENT, // 评论框默认值
    isReply: false,
    commentLevel: COMMENT,
    replyUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId = "", isLike } = options;
    this._getMomentDetail(momentId);
    this.onShow(Boolean(isLike));
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
          // 增加效率, 只查询两条数据
          start: 0,
          count: 2,
          $url: "/moment/detail"
        }
      })
      .then(res => {
        const {
          result: { moment, commentList }
        } = res;
        const { likeCount, isLike, commentCount } = moment;
        let firstComment = {};
        if (commentCount > 0) {
          firstComment = commentList[0];
          const { children = [] } = firstComment;
          // 只展示两条以内的回复数据
          const length = children.length <= 2 ? children.length : 2;
          // 用来判断是否显示【查看更多】的字段
          const isAll = children.length <= 2 ? true : false;
          firstComment.isAll = isAll;
          children.splice(length);
          firstComment.createTime = formatTime(
            new Date(firstComment.createTime)
          );
        }
        const isExpand = commentList.length > 1;
        this.setData({
          moment,
          momentId,
          commentCount,
          firstComment,
          isExpand,
          isLike,
          likeCount
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

  // 直接评论
  onComment(event) {
    const { detail } = event;
    const { momentId, commentLevel } = this.data;
    wx.showLoading({
      title: "发表中"
    });
    const userInfo = app.getUserInfo()
    const comment = {
      ...userInfo,
      momentId,
      content: detail,
      type: commentLevel
    };
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          comment,
          $url: "comment"
        }
      })
      .then(() => {
        this._initData();
        wx.hideLoading({
          complete: res => {
            if (res.errMsg === "hideLoading:ok") {
              this._getMomentDetail(momentId);
              wx.showToast({
                title: "评论成功!"
              });
              const {
                moment: { _openid, img = [], content }
              } = this.data;
              const _img = img.length > 0 ? img[0] : "";
              notify(
                _openid,
                COMMENT_REPLY,
                notifyAction.COMMENT,
                momentId,
                content,
                _img
              );
            }
          }
        });
      });
  },

  // 回复
  onReply(event) {
    const { detail } = event;
    const { momentId, currentCommentId, commentLevel, replyUser } = this.data;
    wx.showLoading({
      title: "发表中"
    });
    const userInfo = app.getUserInfo()
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
        this._initData();
        wx.hideLoading({
          complete: res => {
            if (res.errMsg === "hideLoading:ok") {
              this._getMomentDetail(momentId);
              wx.showToast({
                title: "回复成功!"
              });
              const {
                moment: { _openid, img = [], content }
              } = this.data;
              const _img = img.length > 0 ? img[0] : "";
              notify(
                _openid,
                COMMENT_REPLY,
                notifyAction.REPLY,
                momentId,
                content,
                _img
              );
            }
          }
        });
      });
  },

  // 进入评论详情页
  enterCommentDetail(event) {
    const { momentId } = this.data;
    const {
      currentTarget: {
        dataset: { commentid }
      }
    } = event;
    wx.navigateTo({
      url: `../comment-detail/comment-detail?momentId=${momentId}&commentId=${commentid}`
    });
  },

  // 进入评论列表页
  enterCommentList() {
    const { momentId } = this.data;
    wx.navigateTo({
      url: `../comment-list/comment-list?momentId=${momentId}`
    });
  },

  // 点赞
  handleLike() {
    const { isLike, likeCount, moment } = this.data;
    const { _id: momentId, _openid: reciever_id, img = [], content } = moment;
    const url = isLike ? "cancelLike" : "giveLike";
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          momentId,
          $url: url
        }
      })
      .then(() => {
        this.setData({
          likeCount: isLike ? likeCount - 1 : likeCount + 1,
          isLike: !isLike
        });
        // 发送通知
        if (!isLike) {
          // const contentType = img.length > 0 ? IMG : TEXT;
          const _img = img.length > 0 ? img[0] : "";
          notify(
            reciever_id,
            LIKE,
            notifyAction.GIVE_LIKE,
            momentId,
            content,
            _img
          );
        }
      })
      .catch(err => {
        console.log(err);
        wx.showToast({
          title: "操作失败",
          icon: "none"
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
