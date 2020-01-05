const app = getApp()
let userInfo = {}

Component({
  data: {
    loginShow: false,
    commentShow: false,
    isLike: false,
    likeCount: 0, // 点赞数
  },
  properties: {
    moment: Object,
  },
  options: {
    styleIsolation: 'apply-shared',
  },
  lifetimes: {
    ready() {
      const { globalData: { openid } } = app
      const { likes = [] } = this.properties.moment
      this.setData({
        isLike: likes.includes(openid),
        likeCount: likes.length,
      })
    }
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

    // 点赞功能
    handleClickLike() {
      const { isLike, likeCount } = this.data
      const { moment: { _id: momentId } } = this.properties
      const url = isLike ? 'cancelLike' : 'giveLike'
      wx.cloud.callFunction({
        name: 'community',
        data: {
          momentId,
          $url: url,
        }
      })
      .then(() => {
        this.setData({
          likeCount: isLike ? likeCount - 1 : likeCount + 1,
          isLike: !isLike,
        })
      })
      .catch((err) => {
        console.log(err)
        wx.showToast({
          title: '点赞失败',
          icon: 'none',
        });
      })
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