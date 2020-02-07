// pages/record/record.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pets: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadPetList();
  },

  // 加载宠物列表
  _loadPetList() {
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "pet",
        data: {
          $url: "list"
        }
      })
      .then(res => {
        const {
          result: { data }
        } = res;
        this.setData({
          pets: data
        });
        wx.hideLoading();
      });
  },

  // 进入宠物添加页
  enterPetAdd() {
    wx.navigateTo({
      url: "./pet-add/pet-add"
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
