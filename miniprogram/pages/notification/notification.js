import {
  SYSTEM,
  STAR,
  LIKE,
  COMMENT_REPLY
} from "../../utils/notify/notifyType";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    notifyType: {
      SYSTEM,
      STAR,
      LIKE,
      COMMENT_REPLY
    },
    notifyCount: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._init();
  },

  _init() {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "notification",
        data: {
          $url: "index"
        }
      })
      .then(res => {
        const { result } = res;
        app.getUnreadMsg();
        this.setData({
          notifyCount: result
        });
        wx.stopPullDownRefresh();
        wx.hideLoading();
      });
  },

  _handleHasRead(type) {
    const {
      notifyCount: { total }
    } = this.data;
    let currentCount;
    switch (type) {
      case SYSTEM:
        const {
          notifyCount: { system }
        } = this.data;
        currentCount = system;
        this.setData({
          ["notifyCount.system"]: 0
        });
        break;
      case LIKE:
        const {
          notifyCount: { like }
        } = this.data;
        currentCount = like;
        this.setData({
          ["notifyCount.like"]: 0
        });
        break;
      case STAR:
        const {
          notifyCount: { star }
        } = this.data;
        currentCount = star;
        this.setData({
          ["notifyCount.star"]: 0
        });
        break;
      case COMMENT_REPLY:
        const {
          notifyCount: { comment_reply }
        } = this.data;
        currentCount = comment_reply;
        this.setData({
          ["notifyCount.comment_reply"]: 0
        });
        break;
      default:
        currentCount = 0;
        break;
    }
    if (total - currentCount > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: `${total - currentCount}`
      });
    } else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
    wx.cloud
      .callFunction({
        name: "notification",
        data: {
          $url: "read",
          type
        }
      })
      .then(() => {
        wx.navigateTo({
          url: `./detail/detail?type=${type}`
        });
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  enterDetail(event) {
    const {
      currentTarget: {
        dataset: { type }
      }
    } = event;
    if (type === "topic") {
      wx.navigateTo({
        url: `./topic/topic?type=${type}`
      });
    } else {
      this._handleHasRead(type);
    }
  },

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
    this._init();
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
