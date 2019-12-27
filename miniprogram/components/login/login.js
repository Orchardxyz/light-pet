Component({
  data: {},
  properties: {
    modalShow: Boolean,
  },
  options: {
    styleIsolation: 'apply-shared',
  },
  methods: {
    // 微信授权登录
    getUserInfoLogin(event) {
      const userInfo = event.detail.userInfo
      if (userInfo) {
        this.setData({
          modalShow: false,
        })
        this.triggerEvent('loginSuccess', userInfo)
      } else {
        this.triggerEvent('loginFail')
      }

    },

  }
})