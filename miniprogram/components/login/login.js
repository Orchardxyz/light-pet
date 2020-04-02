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
    _getCurrentPageUrl() {
      const pages = getCurrentPages(); //获取加载的页面
      const currentPage = pages[pages.length - 1]; //获取当前页面的对象
      const url = currentPage.route; //当前页面url
      const options = currentPage.options; //如果要获取url中所带的参数可以查看options

      //拼接url的参数
      let urlWithArgs = `../../${url}?`;
      for (let key in options) {
        const value = options[key];
        urlWithArgs += key + "=" + value + "&";
      }
      urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);

      return urlWithArgs;
    },
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
        const url = this._getCurrentPageUrl();
        wx.reLaunch({ url });
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
