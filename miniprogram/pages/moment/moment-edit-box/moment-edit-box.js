import msgCheck from "../../../utils/security/msgCheck";
import imgCheck from "../../../utils/security/imgCheck";
import secWarn from "../../../utils/security/secWarn";

const MAX_WORDS_NUM = 140;
const MAX_IMAGE_NUM = 9;
let content = "";
let userInfo = {};

Page({
  data: {
    inputWordsNum: 0,
    footerBottom: 0, // 底部键盘弹出时【发布】的按钮栏高度
    images: [],
    selectPhoto: true,
    pet: {}
  },

  onLoad(options) {
    const { nickName, avatarUrl, index } = options;
    const petList = wx.getStorageSync("petList");
    userInfo = {
      nickName,
      avatarUrl
    };
    this.setData({
      pet: petList[index]
    });
  },

  // 监听输入的字数
  handleInput(event) {
    let inputWordsNum = event.detail.value.length;
    if (inputWordsNum >= MAX_WORDS_NUM) {
      inputWordsNum = `最大字数为${MAX_WORDS_NUM}`;
    }
    this.setData({
      inputWordsNum
    });
    content = event.detail.value;
  },

  /**
   * 手机键盘弹起落下时的发布按钮部分样式变化
   * @param {*} event
   */
  handleFocus(event) {
    this.setData({
      footerBottom: event.detail.height
    });
  },
  handleBlur() {
    this.setData({
      footerBottom: 0
    });
  },

  // 选择图片
  chooseImage() {
    // 当前还可选择的最多图片数
    let max = MAX_IMAGE_NUM - this.data.images.length;
    wx.chooseImage({
      count: max,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: result => {
        this.setData({
          images: this.data.images.concat(result.tempFilePaths)
        });
        max = MAX_IMAGE_NUM - this.data.images.length;
        this.setData({
          selectPhoto: max <= 0 ? false : true
        });
      }
    });
  },

  // 删除图片
  delImage(event) {
    this.data.images.splice(event.target.dataset.index, 1);
    this.setData({
      images: this.data.images
    });
    if (this.data.images.length === MAX_IMAGE_NUM - 1) {
      this.setData({
        selectPhoto: true
      });
    }
  },

  // 预览图片
  previewImage(event) {
    wx.previewImage({
      current: event.target.data.imgsrc,
      urls: this.data.images
    });
  },

  // 发布动态
  handleSend() {
    if (content.trim() === "") {
      wx.showModal({
        title: "内容不能为空！",
        content: ""
      });
      return;
    }

    wx.showLoading({
      title: "发布中",
      mask: true
    });

    if (msgCheck(content)) {
      let { images } = this.data;
      let allImagesPromise = [];
      let fileIDs = [];
      for (let i = 0, len = images.length; i < len; i++) {
        let imagePromise = new Promise((resolve, reject) => {
          let image = images[i];
          if (imgCheck(image)) {
            let suffix = /\.\w+$/.exec(image)[0]; // 文件扩展名
            wx.cloud.uploadFile({
              // 路径名称唯一
              cloudPath: `moments/${Date.now()}-${Math.random() *
                1000000}${suffix}`,
              filePath: image,
              success: result => {
                fileIDs = fileIDs.concat(result.fileID);
                resolve();
              },
              fail: () => {
                reject();
              }
            });
          } else {
            wx.hideLoading();
            secWarn("img");
            return;
          }
        });
        allImagesPromise.push(imagePromise);
      }
      // 存入云数据库
      Promise.all(allImagesPromise).then(() => {
        const { pet } = this.data;
        const moment = {
          ...userInfo,
          content,
          pet,
          img: fileIDs,
          likes: [] // 点赞列表
        };
        wx.cloud
          .callFunction({
            name: "community",
            data: {
              moment,
              $url: "addMoment"
            }
          })
          .then(() => {
            wx.hideLoading();
            wx.reLaunch({
              url: "../../community/community?index=1",
            });
          })
          .catch(err => {
            console.log(err);
            wx.hideLoading();
            wx.showToast({
              title: "发布失败"
            });
          });
      });
    } else {
      wx.hideLoading();
      secWarn("msg");
      return;
    }
  }
});
