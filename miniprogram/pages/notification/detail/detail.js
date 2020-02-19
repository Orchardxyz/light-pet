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
    notificationList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { type } = options;
    this._setPageTitle(type)
    this._init(type);
  },

  _init(type) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "notification",
        data: {
          $url: "get",
          type
        }
      })
      .then(res => {
        const { result } = res;
        this.setData({
          notificationList: result
        });
        wx.hideLoading();
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
