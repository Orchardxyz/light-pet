import formatTime from "../../utils/formatTime";
import { STAR } from "../../utils/notify/notifyType";
import { STAR_MOMENT } from "../../utils/notify/notifyAction";
import { IMG, TEXT } from "../../utils/notify/contentType";
import notify from "../../utils/notify/notify";

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
            const { _openid, img = [] } = moment;
            const contentType = img.length > 0 ? IMG : TEXT;
            const _content = img.length > 0 ? img[0] : content;
            notify(_openid, STAR, STAR_MOMENT, momentId, _content, contentType)
          });
      }
    }
  }
});
