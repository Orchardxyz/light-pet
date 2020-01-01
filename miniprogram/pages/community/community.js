// pages/community/community.js
// 每页获取的最大数据
const MAX_COUNT = 10

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    navbarActiveIndex: 0,
    navbarTitle: ["社区", "关注"],
    momentList: [],
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
    this._loadCommunityMoments()
  },

  // 初始化动态列表
  _initMomentsList() {
    this.setData({
      momentList: [],
    })
  },

  // 加载社区所有动态
  _loadCommunityMoments(start = 0) {
    if (start === 0) {
      this._initMomentsList()
    }
    wx.showLoading({
      title: '拼命加载中',
      mask: true,
    });
    // 请求数据
    wx.cloud.callFunction({
      name: 'community',
      data: {
        start,
        count: MAX_COUNT,
        $url: 'getAllMomentList',
      }
    })
    .then(res => {
      this.setData({
        momentList: this.data.momentList.concat(res.result),
      })
      wx.hideLoading();
      wx.stopPullDownRefresh();
    })
  }, 

  // 加载关注的好友动态列表
  _loadCommunityFollowingList(start = 0) {
    if (start === 0) {
      this._initMomentsList()
    }
    wx.showLoading({
      title: '拼命加载中',
      mask: true,
    });
    this.setData({
      momentList: this.data.momentList.concat(['follow1', 'follow2', 'follow3'])
    })
    wx.hideLoading();
  },

  /**
   * 点击导航栏
   */
  handleNavBarTap(event) {
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex
    this.setData({
      navbarActiveIndex: navbarTapIndex      
    })
    navbarTapIndex === 0 
    ? this._loadCommunityMoments()
    : this._loadCommunityFollowingList()
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
    this._initMomentsList()
    this.data.navbarActiveIndex === 0
    ? this._loadCommunityMoments()
    : this._loadCommunityFollowingList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const start = this.data.momentList.length
    this.data.navbarActiveIndex === 0
    ? this._loadCommunityMoments(start)
    : this._loadCommunityFollowingList(start)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})