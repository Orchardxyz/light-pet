// miniprogram/pages/user/star/star.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentList: [],
    isAll: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._init();
  },

  _init(start = 0) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "user",
        data: {
          $url: "diary",
          start
        }
      })
      .then(res => {
        const { result } = res;
        const { momentList } = this.data
        this.setData({
          momentList: (start === 0 ? [] : momentList).concat(result),
        });
        if (momentList.length === this.data.momentList.length && momentList.length !== 0) {
          this.setData({
            isAll: true,
          })
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  // 进入动态详情页
  enterMomentDetail(event) {
    const {
      target: {
        dataset: { momentid, islike }
      }
    } = event;
    wx.navigateTo({
      url: `../../moment/moment-detail/moment-detail?momentId=${momentid}&isLike=${islike}`
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
  onReachBottom: function() {
    const { isAll, momentList } = this.data
    if (!isAll) {
      this._init(momentList.length)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
