import { COMMENT } from "../../utils/commentType";
const app = getApp();
let userInfo = {};

Component({
  data: {
    loginShow: false,
    commentShow: false,
    footerBottom: 0,
    isLike: false,
    likeCount: 0, // 点赞数
    commentCount: 0, // 评论数
    content: ''
  },
  properties: {
    moment: Object
  },
  options: {
    styleIsolation: "apply-shared"
  },
  lifetimes: {
    ready() {
      const {
        globalData: { openid }
      } = app;
      const { likes = [], commentCount } = this.properties.moment;
      this.setData({
        isLike: likes.includes(openid),
        likeCount: likes.length,
        commentCount
      });
    }
  },
  methods: {
    handleLoginSuccess(event) {
      userInfo = event.detail;
      this.setData(
        {
          loginShow: false
        },
        () => {
          this.setData({
            commentShow: true
          });
        }
      );
    },

    handleLoginFail() {
      wx.showModal({
        title: "只有已登录的用户才能进行评论",
        content: ""
      });
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
    hanldeBlur() {
      this.setData({
        footerBottom: 0
      });
    },

    // 点赞功能
    handleClickLike() {
      const { isLike, likeCount } = this.data;
      const {
        moment: { _id: momentId }
      } = this.properties;
      const url = isLike ? "cancelLike" : "giveLike";
      wx.cloud
        .callFunction({
          name: "community",
          data: {
            momentId,
            $url: url
          }
        })
        .then(() => {
          this.setData({
            likeCount: isLike ? likeCount - 1 : likeCount + 1,
            isLike: !isLike
          });
        })
        .catch(err => {
          console.log(err);
          wx.showToast({
            title: "点赞失败",
            icon: "none"
          });
        });
    },

    // 点击评论图标
    handleComment() {
      wx.getSetting({
        success: result => {
          if (result.authSetting["scope.userInfo"]) {
            wx.getUserInfo({
              withCredentials: "false",
              lang: "zh_CN",
              timeout: 10000,
              success: result => {
                userInfo = result.userInfo;
                this.setData({
                  commentShow: true
                });
              }
            });
          } else {
            this.setData({
              loginShow: true
            });
          }
        }
      });
    },

    // 评论
    handleSubmit(event) {
      let content = event.detail.value.content;
      if (content.trim() === "") {
        wx.showModal({
          title: "评论内容不能为空!"
        });
        return;
      }
      wx.showLoading({
        title: "评论发表中"
      });
      const {
        moment: { _id: momentId }
      } = this.properties;
      const { avatarUrl, nickName } = userInfo;
      const comment = {
        momentId,
        avatarUrl,
        nickName,
        content,
        type: COMMENT
      };
      wx.cloud.callFunction({
        name: "community",
        data: {
          $url: "comment",
          comment
        }
      })
      .then(() => {
        wx.hideLoading();
        this.setData({
          commentShow: false,
          content: '',
        })
        wx.showToast('发表成功')
      })
    }
  }
});
