// miniprogram/pages/notification/detail/detail.js
import {
  SYSTEM,
  STAR,
  LIKE,
  COMMENT_REPLY
} from "../../../utils/notify/notifyType";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    type: "",
    notificationList: [],
    isAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { type } = options;
    this._setPageTitle(type);
    this._init(type);
  },

  _init(type, start = 0) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "notification",
        data: {
          $url: "get",
          type,
          start
        }
      })
      .then(res => {
        const { result } = res;
        const { notificationList } = this.data;
        this.setData({
          type,
          notificationList:
            start === 0 ? [].concat(result) : notificationList.concat(result)
        });
        if (this.data.notificationList.length === notificationList.length && notificationList.length !== 0) {
          this.setData({
            isAll: true
          });
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  // 设置页面名字
  _setPageTitle(type) {
    let title = "";
    switch (type) {
      case SYSTEM:
        title = "系统通知";
        break;
      case STAR:
        title = "收藏";
        break;
      case LIKE:
        title = "赞";
        break;
      case COMMENT_REPLY:
        title = "评论和回复";
        break;
    }
    wx.setNavigationBarTitle({
      title
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
    const { type } = this.data;
    this._init(type);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const { type, notificationList, isAll } = this.data;
    if (!isAll) {
      this._init(type, notificationList.length);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
