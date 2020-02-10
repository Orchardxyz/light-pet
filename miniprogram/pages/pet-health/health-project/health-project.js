// miniprogram/pages/pet/pet-health/pet-health.js
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { petId } = options;
    this._getCurrentPet(petId);
  },

  _getCurrentPet(petId) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "pet",
        data: {
          $url: "get",
          petId
        }
      })
      .then(res => {
        const {
          result: { data }
        } = res;
        const { species } = data;
        if (species === "cat") {
          wx.setNavigationBarTitle({
            title: "喵喵注意事项"
          });
        } else if (species === "dog") {
          wx.setNavigationBarTitle({
            title: "狗狗注意事项"
          });
        }
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
