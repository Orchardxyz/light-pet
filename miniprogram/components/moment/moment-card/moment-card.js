import formatTime from "../../../utils/formatTime";
import { STAR } from "../../../utils/notify/notifyType";
import { STAR_MOMENT } from "../../../utils/notify/notifyAction";
import notify from "../../../utils/notify/notify";

const app = getApp();

Component({
  data: {
    loginStatus: false,
    loginShow: false,
    createTime: "",
    isStar: false,
    menuShow: false,
    isMenuOpen: false,
  },
  properties: {
    moment: Object,
  },
  options: {
    styleIsolation: "apply-shared",
  },
  observers: {
    moment(mObj) {
      const { createTime, isStar } = mObj;
      if (app.isLogin()) {
        this.setData({
          loginStatus: true,
        });
        if (isStar) {
          this.setData({
            isStar,
          });
        }
      }
      if (createTime) {
        this.setData({
          createTime: formatTime(new Date(createTime)),
        });
      }
    },
  },
  methods: {
    _setLoginShow() {
      this.setData({
        loginShow: true,
      });
    },

    previewImage(event) {
      const dataset = event.target.dataset;
      wx.previewImage({
        current: dataset.imgsrc,
        urls: dataset.imgs,
      });
    },

    // 收藏/取消收藏
    handleStar() {
      if (app.isLogin()) {
        const { isStar } = this.data;
        const { moment = {} } = this.properties;
        const { _id: momentId } = moment;
        wx.showLoading({
          title: "稍等",
          mask: true,
        });
        if (isStar) {
          wx.cloud
            .callFunction({
              name: "community",
              data: {
                $url: "unstar",
                momentId,
              },
            })
            .then(() => {
              this.setData({
                isStar: !isStar,
              });
              wx.hideLoading();
              wx.showToast({
                title: "取消收藏",
                icon: "none",
              });
            });
        } else {
          wx.cloud
            .callFunction({
              name: "community",
              data: {
                $url: "star",
                moment,
              },
            })
            .then(() => {
              this.setData({
                isStar: !isStar,
              });
              wx.hideLoading();
              wx.showToast({
                title: "收藏成功",
                icon: "none",
              });
              const { _openid, nickName, img = [], content } = moment;
              const _img = img.length > 0 ? img[0] : "";
              notify(
                _openid,
                nickName,
                STAR,
                STAR_MOMENT,
                { momentId },
                content,
                _img
              );
            });
        }
      } else {
        this._setLoginShow();
      }
    },

    openMenu() {
      this.setData({
        isMenuOpen: true,
      });
    },

    closeMenu() {
      this.setData({
        isMenuOpen: false,
      });
    },

    // 删除
    handleDelete() {
      wx.showModal({
        content: "确认删除本条内容吗？",
        showCancel: true,
        cancelText: "取消",
        cancelColor: "#000000",
        confirmText: "确定",
        confirmColor: "#3CC51F",
        success: (result) => {
          if (result.confirm) {
            const {
              moment: { _id: momentId },
            } = this.data;
            this.closeMenu();
            this.triggerEvent("onDelete", momentId);
          }
        },
      });
    },
  },
});
