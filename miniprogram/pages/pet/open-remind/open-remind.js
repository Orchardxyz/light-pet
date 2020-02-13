// miniprogram/pages/pet/open-remind/open-remind.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    init: true,
    remindId: "",
    pet: {},
    project: "",
    planTime: {},
    isReminded: false,
    remindTime: {},
    closeLoading: false,
    finishLoading: false,
    closeTxt: "关闭提醒",
    finishTxt: "",
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { remindId } = options;
    this._loadRemindDetail(remindId);
    this.setData({
      remindId
    });
  },

  _loadRemindDetail(remindId) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "/remind/get",
          remindId
        }
      })
      .then(res => {
        const {
          result: {
            pet = {},
            project,
            planTime = {},
            isReminded,
            remindTime = {}
          }
        } = res;
        this.setData({
          pet,
          project,
          planTime,
          isReminded,
          remindTime,
          finishTxt: `完成本次${project}`,
          init: false
        });
        wx.hideLoading();
      });
  },

  _closeRemind() {
    this.setData({
      closeLoading: true,
      disabled: true,
      closeTxt: "关闭中"
    });
    const { remindId } = this.data;
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "/remind/delete",
          remindId
        }
      })
      .then(() => {
        this.setData({
          closeLoading: false,
        });
        wx.showToast({
          title: '已关闭',
          icon: 'success',
        });
        const currentPages = getCurrentPages();
        if (currentPages.length > 1) {
          const prevPage = currentPages[currentPages.length - 2];
          prevPage._loadPetList();
          wx.navigateBack({
            delta: 1
          });
        }
      });
  },

  handleCloseRemind() {
    wx.showModal({
      title: "",
      content: "关闭以后需要重新添加提醒项，确认关闭？",
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#000000",
      confirmText: "确定",
      confirmColor: "#3CC51F",
      success: result => {
        if (result.confirm) {
          this._closeRemind();
        }
      }
    });
  },

  // 完成
  handleFinish() {
    this.setData({
      finishLoading: true,
      disabled: true
    });
    const { remindId, isReminded } = this.data;
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "/remind/finish",
          remindId,
          isReminded
        }
      })
      .then(() => {
        this.setData({
          finishLoading: false,
          finishTxt: "已完成"
        });
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
