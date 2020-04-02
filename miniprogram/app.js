//app.js
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: "light-pet-test-bdanx", // 测试环境
        // env: "light-pet-release-l8ncn",
        traceUser: true
      });
    }

    this.globalData = {
      isLogin: false
    };

    this._init();

    // 获取用户信息
    // this.getUserInfo();
    // 获取宠物列表
    // this.getPetList();
    // 获取未读消息数
    // this.getUnreadMsg();
  },

  _login() {
    const userInfo = this.getUserInfo();
    wx.cloud.callFunction({
      name: "user",
      data: {
        $url: "login",
        userInfo,
        timestamp: Date.now()
      }
    });
  },

  _init() {
    wx.getSetting({
      success: result => {
        if (result.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            success: result => {
              const { userInfo } = result;
              this.setLoginData(true, userInfo);
              this._login();
            }
          });
        } else {
          this.setLoginData(false, {});
        }
      }
    });
  },

  isLogin() {
    return this.globalData.isLogin;
  },

  getUserInfo() {
    return wx.getStorageSync("userInfo");
  },

  setLoginData(isLogin, userInfo) {
    this.globalData.isLogin = isLogin;
    wx.setStorageSync("userInfo", userInfo);
    if (isLogin) {
      this.getPetList();
      this.getUnreadMsg();
    } else {
      this.setPetList([]);
    }
  },

  getPetList() {
    wx.cloud
      .callFunction({
        name: "pet",
        data: {
          $url: "list"
        }
      })
      .then(res => {
        const { result = [] } = res;
        wx.setStorageSync("petList", result);
      });
  },

  setPetList(data) {
    wx.setStorageSync("petList", data);
  },

  getUnreadMsg() {
    wx.cloud
      .callFunction({
        name: "notification",
        data: {
          $url: "index"
        }
      })
      .then(res => {
        const { result } = res;
        const { total } = result;
        if (total > 0 && total < 100) {
          wx.setTabBarBadge({
            index: 2,
            text: `${total}`
          });
        } else if (total > 99) {
          wx.setTabBarBadge({
            index: 1,
            text: "99+"
          });
        }
      });
  }
});
