import formatTime from "../../../utils/formatTime";
import { COMMENT, FIRST_REPLY, SECOND_REPLY } from "../../../utils/commentType";
import { LIKE, COMMENT_REPLY } from "../../../utils/notify/notifyType";
import notifyAction from "../../../utils/notify/notifyAction";
import notify from "../../../utils/notify/notify";
import msgCheck from "../../../utils/security/msgCheck";
import secWarn from "../../../utils/security/secWarn";

const DEFAULT_PLACHOLDER = "请在此输入评论";
const DEFAULT_COMMENT = "";
const app = getApp();

let replyContent = ''

Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentId: "",
    moment: {},
    currentCommentId: "",
    firstComment: {},
    isExpand: false, // 查看更多的按钮是否展开
    // 回复框
    isReplyOpen: false,
    wordNum: 0,
    MAX_REPLY_COUNT: 200,
    replyPlaceholder: DEFAULT_PLACHOLDER, // 回复框中的默认文字
    defaultReplyValue: DEFAULT_COMMENT, // 回复框默认值
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
      title: "加载中",
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
        wx.stopPullDownRefresh();
      });
  },

  // 初始化数据
  _initData() {
    this.setData({
      currentCommentId: "",
      replyPlaceholder: DEFAULT_PLACHOLDER,
      defaultReplyValue: DEFAULT_COMMENT,
    });
  },

  closeReplyDialog() {
    this.setData({
      isReplyOpen: false,
      wordNum: 0,
      replyPlaceholder: DEFAULT_PLACHOLDER,
      defaultReplyValue: DEFAULT_COMMENT,
    })
    replyContent = ''
  },

  handleReplyInput(event) {
    const {
      detail: { value }
    } = event;
    replyContent = value;
    this.setData({
      wordNum: value.length
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
      isReplyOpen: true,
      currentCommentId: commentid,
      replyPlaceholder: `回复@${nickname}：`,
      defaultReplyValue: "",
      commentLevel: FIRST_REPLY
    });
  },

  // 直接评论
  onComment(event) {
    const { detail } = event;
    const { momentId } = this.data;
    if (detail.trim() === "") {
      wx.showModal({
        title: "评论内容不能为空!"
      });
      return;
    }
    wx.showLoading({
      title: "发表中"
    });
    if (msgCheck(detail)) {
      const userInfo = app.getUserInfo();
      const comment = {
        ...userInfo,
        momentId,
        content: detail,
        type: COMMENT
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
                  moment: { _openid, nickName, img = [], content }
                } = this.data;
                const _img = img.length > 0 ? img[0] : "";
                notify(
                  _openid,
                  nickName,
                  COMMENT_REPLY,
                  notifyAction.COMMENT,
                  { momentId },
                  content,
                  _img,
                  detail
                );
              }
            }
          });
        });
    } else {
      secWarn("msg");
      return;
    }
  },

  // 回复
  onReply() {
    const { momentId, currentCommentId, commentLevel, replyUser } = this.data;
    if (replyContent.trim() === "") {
      wx.showModal({
        title: "回复内容不能为空!"
      });
      return;
    }

    wx.showLoading({
      title: "发表中"
    });
    if (msgCheck(replyContent)) {
      const userInfo = app.getUserInfo();
      const reply = {
        ...userInfo,
        replyUser,
        currentMomentId: momentId,
        currentCommentId,
        content: replyContent,
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
                this.closeReplyDialog()
                this._getMomentDetail(momentId);
                wx.showToast({
                  title: "回复成功!"
                });
                const {
                  moment: { _id, img = [] }
                } = this.data;
                const { firstComment } = this.data;
                const { content } = firstComment;
                const _img = img.length > 0 ? img[0] : "";
                notify(
                  commentLevel === FIRST_REPLY
                    ? firstComment._openid
                    : replyUser._openid,
                  commentLevel === FIRST_REPLY
                    ? firstComment.nickName
                    : replyUser.nickName,
                  COMMENT_REPLY,
                  notifyAction.REPLY,
                  { momentId: _id, commentId: currentCommentId },
                  content,
                  _img,
                  replyContent
                );
              }
            }
          });
        });
    } else {
      wx.hideLoading();
      secWarn("msg");
      return;
    }
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
    const { moment = {}} = this.data;
    const {
      _id: momentId,
      _openid: reciever_id,
      nickName,
      img = [],
      content,
      isLike,
      likeCount
    } = moment;
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
          ['moment.likeCount']: isLike ? likeCount - 1 : likeCount + 1,
          ['moment.isLike']: !isLike
        });
        // 发送通知
        if (!isLike) {
          const _img = img.length > 0 ? img[0] : "";
          notify(
            reciever_id,
            nickName,
            LIKE,
            notifyAction.GIVE_LIKE,
            { momentId },
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
  onPullDownRefresh: function() {
    const { momentId } = this.data;
    this._getMomentDetail(momentId);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
