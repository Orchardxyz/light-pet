const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginStatus: true,
    loginShow: false,
    userInfo: {},
    petNum: 0,
    unReadMsgNum: undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._init();
  },

  handleLogin() {
    this.setData({
      loginStatus: false,
      loginShow: true,
    });
  },

  _init() {
    if (app.isLogin()) {
      wx.showLoading({
        title: "稍等",
        mask: true,
      });
      const userInfo = wx.getStorageSync("userInfo");
      this.setData({
        userInfo,
      });
      wx.cloud
        .callFunction({
          name: "user",
          data: {
            $url: "index",
          },
        })
        .then((res) => {
          const {
            result: { petNum, unReadMsgNum },
          } = res;
          this.setData({
            petNum,
            unReadMsgNum,
            loginStatus: true,
            loginShow: false,
          });
          wx.hideLoading();
        });
    } else {
      this.handleLogin();
    }
  },

  enterDiary() {
    if (app.isLogin()) {
      wx.navigateTo({
        url: "./diary/diary",
      });
    } else {
      this.handleLogin();
    }
  },

  enterMyLike() {
    if (app.isLogin()) {
      wx.navigateTo({
        url: "./like/like",
      });
    } else {
      this.handleLogin();
    }
  },

  enterMyStar() {
    if (app.isLogin()) {
      wx.navigateTo({
        url: "./star/star",
      });
    } else {
      this.handleLogin();
    }
  },

  onShare() {
    wx.showLoading({
      title: "生成中",
      mask: true,
    });
    wx.cloud
      .callFunction({
        name: "user",
        data: {
          $url: "share",
        },
      })
      .then((res) => {
        const { result: fileID } = res;
        wx.previewImage({
          current: fileID,
          urls: [fileID],
        });
        wx.hideLoading();
      });
  },

  enterAdopt() {
    wx.navigateToMiniProgram({
      appId: "wxfcab74a6b36a17b1",
      path: "/page/home/home",
      extraData: {},
      envVersion: "develop",
      success: res => {
        console.log(res)
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this._init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this._init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
