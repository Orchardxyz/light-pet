// pages/community/community.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
  },

  // 发布动态
  onPublish() {
    // 判断有无授权登录
    wx.getSetting({
      success: (result)=>{
        if (result.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            withCredentials: 'false',
            lang: 'zh_CN',
            timeout:10000,
            success: (result)=>{
              this.onLoginSuccess({
                detail: result.userInfo
              })
            },
          });
        } else {
          this.setData({
            modalShow: true
          })
        }
      },
    });
  },

  // 登录成功
  onLoginSuccess(event) {
    const detail = event.detail
    wx.navigateTo({
      url: `../moment-edit-box/moment-edit-box?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`
    })
  },
  // 登录失败
  onLoginFail() {
    wx.showModal({
      title: '只有已登录的用户才能够发布动态',
      content: '',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})