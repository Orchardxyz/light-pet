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
    disabled: false,
    returnBtnShow: false // 返回按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { remindId } = options;
    this._loadRemindDetail(remindId);
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
          remindId,
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
          closeLoading: false
        });
        wx.showToast({
          title: "已关闭",
          icon: "success"
        });
        // 返回上一页并刷新
        wx.navigateBack();
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage.onPullDownRefresh();
      });
  },

  // 加入时间轴记录
  _addTimeline() {
    const { remindId, pet } = this.data;
    const petArr = [pet].map(({ _id, owner_id, petAvatar, petName, sex }) => ({
      _id,
      owner_id,
      petAvatar,
      petName,
      sex
    }));
    wx.cloud.callFunction({
      name: "petHealth",
      data: {
        $url: "/timeline/add",
        remindId,
        pet: petArr[0]
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
          isReminded,
          finishTime: Date.now()
        }
      })
      .then(() => {
        this._addTimeline();
        this.setData({
          finishLoading: false,
          finishTxt: "已完成",
          returnBtnShow: true
        });
      });
  },

  handleReturn() {
    // 返回上一页并刷新
    wx.navigateBack();
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.onPullDownRefresh();
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
