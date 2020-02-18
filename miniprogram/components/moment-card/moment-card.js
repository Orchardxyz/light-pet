import formatTime from "../../utils/formatTime";

Component({
  data: {
    createTime: "",
    isStar: false
  },
  properties: {
    moment: Object
  },
  options: {
    styleIsolation: "apply-shared"
  },
  observers: {
    ["moment.createTime"](time) {
      if (time) {
        this.setData({
          createTime: formatTime(new Date(time))
        });
      }
    },
    ["moment.isStar"](isStar) {
      this.setData({
        isStar
      });
    }
  },
  methods: {
    previewImage(event) {
      const dataset = event.target.dataset;
      wx.previewImage({
        current: dataset.imgsrc,
        urls: dataset.imgs
      });
    },

    // 收藏/取消收藏
    handleStar() {
      const { isStar } = this.data;
      const { moment = {} } = this.properties;
      const { _id: momentId } = moment;
      wx.showLoading({
        title: "稍等",
        mask: true
      });
      if (isStar) {
        wx.cloud
          .callFunction({
            name: "community",
            data: {
              $url: "unstar",
              momentId
            }
          })
          .then(() => {
            this.setData({
              isStar: !isStar
            });
            wx.hideLoading();
            wx.showToast({
              title: "取消收藏",
              icon: "none"
            });
          });
      } else {
        wx.cloud
          .callFunction({
            name: "community",
            data: {
              $url: "star",
              moment
            }
          })
          .then(() => {
            this.setData({
              isStar: !isStar
            });
            wx.hideLoading();
            wx.showToast({
              title: "收藏成功",
              icon: "none"
            });
          });
      }
    }
  }
});
