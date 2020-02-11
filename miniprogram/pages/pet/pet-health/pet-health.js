// miniprogram/pages/pet/pet-health/pet-health.js
const OPEN_TXT = '开启健康提醒'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    init: true, // 是否还在加载状态
    hasSet: false,
    petId: "",
    petName: "",
    // 从后台返回前台页面要显示的内容
    project: '',
    introduction: '',
    advice: '',
    icon: '',
    color: '',
    lastTime: '',
    // 设置提醒时间
    planTime: '',
    clock: '',
    advanceDay: ['当天提醒', '提前一天', '提前两天', '提前三天', '提前四天', '提前五天'],
    remindDay: 0,
    // 按钮
    btnSet: false,
    btnShow: false,
    openBtnTxt: OPEN_TXT,
    openBtnLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { petId, petName, projectId, species } = options;
    wx.setNavigationBarTitle({
      title: `${species}提醒事项`,
    });
    this.setData({
      petId,
      petName,
    });
    this._loadProject(projectId);
  },

  _loadProject(projectId) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "project",
          projectId
        }
      })
      .then(res => {
        const {
          result
        } = res;
        const { project, introduction, advice, icon, color, lastTime = '', today } = result
        this.setData({
          project,
          icon,
          color,
          init: false,
          // 小程序的问题, 要在后台数据库将换行符\n替换成其他字符（如&&&&）
          // 再利用前端替换才能显示换行，不然会直接将\n显示在页面
          introduction: introduction.split('&&&').join('\n'),
          advice: advice.split('&&&').join('\n'),
          lastTime,
          planTime: today,
        });
        wx.hideLoading();
      });
  },

  planDateChange(event) {
    const { detail : {value}} = event
    this.setData({
      planTime: value,
    })
  },

  clockChange(event) {
    const { detail : {value}} = event
    this.setData({
      clock: value,
    })
  },

  remindTimeChange(event) {
    const { detail : {value}} = event
    this.setData({
      remindDay: value,
    })
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
