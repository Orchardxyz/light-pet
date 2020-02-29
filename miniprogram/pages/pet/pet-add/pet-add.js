// miniprogram/pages/pet/pet-add/pet-add.js
import DEFAULT_AVATAR from "../../../utils/default-pet";
import { CATS, DOGS } from "../../../utils/petVariety";
import imgCheck from "../../../utils/security/imgCheck";
import secWarn from "../../../utils/security/secWarn";

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
    today: "",
    birthday: "",
    adoptTime: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._init();
  },

  _init() {
    const date = new Date();
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate();
    this.setData({
      today: `${year}-${month}-${day}`
    });
  },

  // 上传头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: res => {
        if (res.errMsg === "chooseImage:ok") {
          const { tempFilePaths } = res;
          this.setData({
            avatar: tempFilePaths[0]
          });
        } else {
          wx.showToast({
            title: "操作失败",
            icon: "warn"
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: "操作失败",
          icon: "warn"
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
    if (
      petName &&
      selectedSex &&
      selectedSpecies &&
      variety &&
      birthday &&
      adoptTime
    ) {
      wx.showLoading({
        title: "保存中",
        mask: true
      });
      if (imgCheck(avatar)) {
        const sex = selectedSex === "male" ? 0 : 1;
        const suffix = /\.\w+$/.exec(avatar)[0]; // 文件扩展名
        wx.cloud.uploadFile({
          // 路径名称唯一
          cloudPath: `pet/${Date.now()}-${Math.random() * 1000000}${suffix}`,
          filePath: avatar,
          success: res => {
            if (res.errMsg === "cloud.uploadFile:ok") {
              const { fileID } = res;
              wx.cloud
                .callFunction({
                  name: "pet",
                  data: {
                    $url: "add",
                    petAvatar: fileID,
                    petName,
                    sex,
                    species: selectedSpecies,
                    variety,
                    birthday,
                    adoptTime
                  }
                })
                .then(res => {
                  const { result } = res;
                  const pet = [result].map(
                    ({ _id, petAvatar, petName, sex, species, variety }) => ({
                      _id,
                      petAvatar,
                      petName,
                      sex,
                      species,
                      variety
                    })
                  );
                  const petList = wx.getStorageSync("petList");
                  wx.setStorageSync("petList", petList.concat(pet));
                  wx.hideLoading();
                  wx.navigateBack();
                  const pages = getCurrentPages();
                  const prevPage = pages[pages.length - 2];
                  prevPage.onPullDownRefresh();
                });
            } else {
              wx.showToast({
                title: "操作失败",
                icon: "warn"
              });
            }
          }
        });
      } else {
        wx.hideLoading();
        secWarn("img");
        return;
      }
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
