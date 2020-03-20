Component({
  data: {
    loginShow: false
  },
  properties: {
    modalShow: Boolean
  },
  options: {
    styleIsolation: "apply-shared"
  },
  observers: {
    modalShow(val) {
      this.setData({
        loginShow: val
      });
    }
  },
  methods: {
    // 微信授权登录
    getUserInfoLogin(event) {
      const app = getApp();
      const { setLoginData } = app;
      const {
        detail: { userInfo }
      } = event;
      if (userInfo) {
        setLoginData(true, userInfo);
        this.setData({
          loginShow: false
        });
        wx.startPullDownRefresh({
          success: result => {
            if (result.errMsg === "startPullDownRefresh:ok") {
              wx.stopPullDownRefresh();
            }
          }
        });
      } else {
        setLoginData(false, {});
        wx.showModal({
          title: "温馨提示",
          content: "要先登录才能体验小程序完整功能哦",
          showCancel: true,
          cancelText: "取消",
          cancelColor: "#000000",
          confirmText: "确定",
          confirmColor: "#3CC51F"
        });
      }
    },
    closeLoginDialog() {
      this.setData({
        loginShow: false
      });
      wx.switchTab({
        url: "/pages/community/community"
      });
    }
  }
});
