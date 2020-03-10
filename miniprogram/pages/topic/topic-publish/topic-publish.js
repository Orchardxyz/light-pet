import msgCheck from "../../../utils/security/msgCheck";
import imgCheck from "../../../utils/security/imgCheck";
import secWarn from "../../../utils/security/secWarn";
import regeneratorRuntime from "../../../utils/runtime";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    type: "",
    topic: "",
    isCustom: false,
    cover: [], // 封面图
    files: [],
    uploadShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { type } = options;
    this.setData({
      type
    });
    if (type === "CUSTOM") {
      this.setData({
        isCustom: true
      });
    } else if (type === "STORY") {
      this.setData({
        topic: "微故事"
      });
    } else if (type === "KNOWLEDGE") {
      this.setData({
        topic: "微知识"
      });
    }
  },

  // 检查表单
  _checkForm(topic = "", title, content) {
    const { isCustom, cover } = this.data;
    if (isCustom) {
      return !(
        topic.trim() === "" ||
        title.trim() === "" ||
        content.trim() === "" ||
        cover.length === 0
      );
    } else {
      const { topic } = this.data;
      return !(
        topic.trim() === "" ||
        title.trim() === "" ||
        content.trim() === "" ||
        cover.length === 0
      );
    }
  },

  chooseCover() {
    const { cover } = this.data;
    const count = 1 - cover.length;
    wx.chooseImage({
      count,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: result => {
        if (result.errMsg === "chooseImage:ok") {
          const { tempFilePaths } = result;
          this.setData({
            cover: tempFilePaths
          });
        }
      }
    });
  },

  previewCover(event) {
    const {
      currentTarget: { dataset }
    } = event;
    const { img } = dataset;
    wx.previewImage({
      current: img,
      urls: [img]
    });
  },

  deleteCover() {
    this.setData({
      cover: []
    });
  },

  chooseImage() {
    const { files } = this.data;
    const count = 3 - files.length;
    wx.chooseImage({
      count,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: result => {
        if (result.errMsg === "chooseImage:ok") {
          const { tempFilePaths } = result;
          const { files } = this.data;
          this.setData({
            files: files.concat(tempFilePaths)
          });
          if (this.data.files.length === 3) {
            this.setData({
              uploadShow: false
            });
          }
        }
      }
    });
  },

  previewImage(event) {
    const {
      currentTarget: { dataset }
    } = event;
    const { images = [], img } = dataset;
    wx.previewImage({
      current: img,
      urls: images
    });
  },

  deleteImage(event) {
    const {
      currentTarget: { dataset }
    } = event;
    const { img } = dataset;
    const { files } = this.data;
    files.splice(files.indexOf(img), 1);
    this.setData({
      files,
      uploadShow: true
    });
  },

  // 发布
  async handlePublish(event) {
    const {
      detail: {
        value: { content, title, topic = "" }
      }
    } = event;
    const { isCustom, type, cover, files } = this.data;
    if (this._checkForm(topic, title, content)) {
      wx.showLoading({
        title: "话题发布中",
        mask: true
      });
      const { nickName, avatarUrl } = app.getUserInfo();
      if (msgCheck(topic + title + content)) {
        const fileIDs = [];
        let coverID = "";
        const reg = /\.\w+$/;
        files.map(async img => {
          if (imgCheck(img)) {
            const suffix = reg.exec(img)[0];
            const { fileID } = await wx.cloud.uploadFile({
              // 路径名称唯一
              cloudPath: `topic/enclosure/${Date.now()}-${Math.random() *
                1000000}${suffix}`,
              filePath: img,
            });
            fileIDs.concat(fileID)
          } else {
            wx.hideLoading();
            secWarn("img");
            return;
          }
        });
        if (imgCheck(cover[0])) {
          const suffix = reg.exec(cover[0])[0];
          const {fileID} = await wx.cloud.uploadFile({
            // 路径名称唯一
            cloudPath: `topic/cover/${Date.now()}-${Math.random() *
              1000000}${suffix}`,
            filePath: cover[0]
          });
          coverID = fileID
        } else {
          wx.hideLoading();
          secWarn("img");
          return;
        }
        const topicObj = {
          nickName,
          avatarUrl,
          topic: isCustom ? topic : this.data.topic,
          title,
          content,
          cover: coverID,
          enclosure: fileIDs,
          type
        };
        wx.cloud
          .callFunction({
            name: "topic",
            data: {
              $url: "publish",
              topicObj
            }
          })
          .then(() => {
            wx.hideLoading();
            wx.showToast({
              title: "发布成功",
              icon: "success",
              duration: 1500
            });
            // 返回上一页并刷新
            wx.navigateBack();
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            prevPage.onPullDownRefresh(2);
          })
          .catch(() => {
            wx.hideLoading();
            wx.showToast({
              title: "发布失败",
              icon: "warn",
              duration: 1500
            });
          });
      } else {
        wx.hideLoading();
        secWarn("msg");
        return;
      }
    } else {
      wx.showModal({
        title: "提示",
        content: "请将表单信息补充完整",
        showCancel: true,
        cancelText: "取消",
        cancelColor: "#000000",
        confirmText: "确定",
        confirmColor: "#3CC51F"
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
