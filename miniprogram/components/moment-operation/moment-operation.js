let userInfo = {}

Component({
  data: {
    loginShow: false,
    commentShow: false,
  },
  properties: {},
  options: {
    styleIsolation: 'apply-shared',
  },
  methods: {
    handleLoginSuccess(event) {
      userInfo = event.detail
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          commentShow: true,
        })
      })
    },

    handleLoginFail() {
      wx.showModal({
        title: '只有已登录的用户才能进行评论',
        content: '',
      });
    },

    // 点击评论图标
    handleComment() {
      wx.getSetting({
        success: (result)=>{
          if (result.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              withCredentials: 'false',
              lang: 'zh_CN',
              timeout:10000,
              success: (result)=>{
                userInfo = result.userInfo
                this.setData({
                  commentShow: true,
                })
              },
            });
          } else {
            this.setData({
              loginShow: true,
            })
          }
        },
      });
    },

    handleSubmit() {

    }
  }
})