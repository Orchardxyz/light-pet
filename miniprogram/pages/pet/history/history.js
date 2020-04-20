// miniprogram/pages/pet/history/history.js
import formatTimeline from "../../../utils/formatTimeline";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pet: {},
    background: '',
    timeline: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { petId } = options;
    this._loadTimeline(petId);
  },

  _loadTimeline(petId) {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "/timeline/get",
          petId,
        },
      })
      .then((res) => {
        const { result } = res;
        const petList = wx.getStorageSync("petList");
        const pet = petList.find(({ _id }) => _id === petId);
        const { petAvatar = "" } = pet;
        this._setBg(petAvatar);
        this.setData({
          pet,
          timeline: formatTimeline(result),
        });
        wx.hideLoading();
      });
  },

  _setBg(avatarUrl) {
    wx.cloud.getTempFileURL({
      fileList: [
        {
          fileID: avatarUrl,
          maxAge: 60 * 60,
        },
      ],
      success: (res) => {
        if (res.errMsg === "cloud.getTempFileURL:ok") {
          const { fileList = [] } = res;
          const { tempFileURL = "" } = fileList[0];
          this.setData({ background: tempFileURL });
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
