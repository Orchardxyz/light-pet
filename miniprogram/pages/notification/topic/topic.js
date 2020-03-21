import {
  TOPIC_LIKE,
  TOPIC_COMMENT_REPLY
} from "../../../utils/notify/notifyType";

const MAX_COUNT = 10;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    init: true,
    navbarTitle: ["赞", "评论回复"],
    navbarActiveIndex: 0,
    notifyList: [],
    isAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // const { type } = options
    this._loadData(TOPIC_LIKE);
  },

  _initData() {
    this.setData({
      init: true,
      notifyList: [],
      isAll: false
    });
  },

  _loadData(type, start = 0) {
    wx.showLoading({
      title: "稍等",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "notification",
        data: {
          $url: "/topic/get",
          type,
          start,
          count: MAX_COUNT
        }
      })
      .then(res => {
        const { result } = res;
        const { notifyList } = this.data;
        if (result.length > 0) {
          this.setData({
            init: false,
            [`notifyList[${notifyList.length}]`]: result
          });
        } else {
          this.setData({
            init: false,
            isAll: true
          });
        }
        wx.hideLoading();
        // TODO 待完善
        this._read(type)
      });
  },

  _read(type) {
    wx.cloud.callFunction({
      name: "notification",
      data: {
        $url: "read",
        type
      }
    });
  },

  _refreshData(navbarIndex) {
    this._initData();
    this.setData({
      navbarActiveIndex: navbarIndex
    });
    switch (navbarIndex) {
      case 0:
        this._loadData(TOPIC_LIKE, 0);
        break;
      case 1:
        this._loadData(TOPIC_COMMENT_REPLY, 0);
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
  onReachBottom: function() {
    const { isAll } = this.data;
    const { navbarActiveIndex, notifyList } = this.data;
    let type = TOPIC_LIKE;
    switch (navbarActiveIndex) {
      case 0:
        type = TOPIC_LIKE;
        break;
      case 1:
        type = TOPIC_COMMENT_REPLY;
        break;
      default:
        break;
    }
    if (!isAll) {
      this._loadData(type, notifyList.length * MAX_COUNT);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
