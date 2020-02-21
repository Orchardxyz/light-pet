
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginShow: false,
    petNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._init();
  },

  _setLoginShow() {
    this.setData({
      loginShow: true
    });
  },

  _init() {
    if (app.isLogin()) {
      wx.showLoading({
        title: "稍等",
        mask: true
      });
      wx.cloud
        .callFunction({
          name: "user",
          data: {
            $url: "getPetNum"
          }
        })
        .then(res => {
          const { result } = res;
          this.setData({
            petNum: result
          });
          wx.hideLoading();
        });
    } else {
      this._setLoginShow();
    }
  },

  enterMyStar() {
    if (app.isLogin()) {
      wx.navigateTo({
        url: "./star/star"
      });
    } else {
      this._setLoginShow();
    }
  },

  onShare() {
    wx.showLoading({
      title: "生成中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "user",
        data: {
          $url: "share"
        }
      })
      .then(res => {
        const { result: fileID } = res;
        wx.previewImage({
          current: fileID,
          urls: [fileID]
        });
        wx.hideLoading();
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
