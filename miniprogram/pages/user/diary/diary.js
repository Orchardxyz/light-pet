import formatTimeline from "../../../utils/formatTimeline";

let MAX_COUNT = 4;
let MAX_TIMELINE = 10;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbarTitle: ["日记", "健康"],
    navbarActiveIndex: 0,
    momentList: [],
    timelineList: [],
    isAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadDiary();
  },

  _init() {
    this.setData({
      momentList: [],
      timelineList: [],
      isAll: false
    });
  },

  _loadDiary(start = 0) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "user",
        data: {
          $url: "diary",
          start,
          count: MAX_COUNT
        }
      })
      .then(res => {
        const { result } = res;
        const { momentList } = this.data;
        if (result.length > 0) {
          this.setData({
            [`momentList[${momentList.length}]`]: result
          });
        } else {
          this.setData({
            isAll: true
          });
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  _loadTimeline(start = 0) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "/timeline/all",
          start,
          count: MAX_TIMELINE
        }
      })
      .then(res => {
        const { result } = res;
        const { timelineList } = this.data;
        if (result.length > 0) {
          this.setData({
            [`timelineList[${timelineList.length}]`]: formatTimeline(result)
          });
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  _refreshData(navbarIndex) {
    this._init();
    this.setData({
      navbarActiveIndex: navbarIndex
    });
    switch (navbarIndex) {
      case 0:
        this._loadDiary();
        break;
      case 1:
        this._loadTimeline();
        break;
      default:
        break;
    }
  },

  handleNavBarTap(event) {
    const {
      currentTarget: {
        dataset: { navbarIndex }
      }
    } = event;
    this._refreshData(navbarIndex);
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
    const { navbarActiveIndex } = this.data;
    this._refreshData(navbarActiveIndex);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const { isAll, momentList, navbarActiveIndex } = this.data;
    if (!isAll) {
      switch (navbarActiveIndex) {
        case 0:
          this._loadDiary(momentList.length * MAX_COUNT);
          break;
        case 1:
          this._loadTimeline();
          break;
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
