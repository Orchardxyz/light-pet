// miniprogram/pages/pet/pet-add/pet-add.js
import DEFAULT_AVATAR from "../../../utils/default-pet";
import { CATS, DOGS } from "../../../utils/petVariety";

const fileManager = wx.getFileSystemManager();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isDefaultAvatar: true,
    avatar: DEFAULT_AVATAR,
    selectedSex: "",
    selectedSpecies: "",
    varieties: [],
    variety: "",
    today: "2020-02-06",
    birthday: "",
    adoptTime: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  // 上传头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: res => {
        const avatar = fileManager.readFileSync(res.tempFilePaths[0], "base64");
        this.setData({
          avatar: `data:image/png;base64,${avatar}`
        });
      },
      fail: () => {
        wx.showToast({
          title: "上传失败",
          icon: "none"
        });
      }
    });
  },

  // 选择性别
  selectSex(event) {
    const {
      currentTarget: {
        dataset: { sex }
      }
    } = event;
    this.setData({
      selectedSex: sex
    });
  },

  // 选择品种
  selectSpecies(event) {
    const {
      currentTarget: {
        dataset: { species }
      }
    } = event;
    let varieties = [];
    if (species === "cat") {
      varieties = CATS;
    } else if (species === "dog") {
      varieties = DOGS;
    }
    this.setData({
      selectedSpecies: species,
      varieties
    });
  },

  handleVarietyChange(event) {
    const {
      detail: { value }
    } = event;
    const { varieties } = this.data;
    this.setData({
      variety: varieties[value]
    });
  },

  handleBirthdayChange(event) {
    const {
      detail: { value }
    } = event;
    this.setData({
      birthday: value
    });
  },

  handleAdoptChange(event) {
    const {
      detail: { value }
    } = event;
    this.setData({
      adoptTime: value
    });
  },

  handleSubmit(event) {
    const {
      detail: {
        value: { petName, birthday, adoptTime }
      }
    } = event;
    const { avatar, selectedSex, selectedSpecies, variety } = this.data;
    if (avatar === DEFAULT_AVATAR) {
      wx.showToast({
        title: "请先上传头像！",
        icon: "none"
      });
      return;
    }
    if (petName && selectedSex && selectedSpecies && variety && birthday) {
      wx.showLoading({
        title: "保存中",
        mask: true
      });
      const sex = selectedSex === "male" ? 0 : 1;
      wx.cloud
        .callFunction({
          name: "pet",
          data: {
            $url: "add",
            avatar,
            petName,
            sex,
            species: selectedSpecies,
            variety,
            birthday,
            adoptTime
          }
        })
        .then(() => {
          wx.hideLoading();
          wx.navigateBack({
            delta: 1
          });
        });
    } else {
      wx.showToast({
        title: "请将爱宠信息补充完整！",
        icon: "none"
      });
    }
  },

  handleCancel() {
    const currentPages = getCurrentPages();
    if (currentPages.length > 1) {
      wx.navigateBack({
        delta: 1
      });
    }
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
