// miniprogram/pages/topic/topic-publish/topic-publish.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    topic: "",
    topicText: "",
    isCustom: false,
    files: [],
    uploadShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { topic } = options;
    this.setData({
      topic
    });
    if (topic === "CUSTOM") {
      this.setData({
        isCustom: true
      });
    } else if (topic === "STORY") {
      this.setData({
        topicText: "微故事"
      });
    } else if (topic === "KNOWLEDGE") {
      this.setData({
        topicText: "微知识"
      });
    }
  },

  chooseImage() {
    wx.chooseImage({
      count: 3,
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
