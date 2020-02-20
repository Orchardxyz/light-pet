import { COMMENT } from "../../utils/commentType";
import checkLogin from "../../utils/checkLogin";

const app = getApp();
const {
  globalData: { userInfo }
} = app;

Component({
  data: {
    loginShow: false,
    commentShow: false,
    footerBottom: 0,
    isLike: false,
    likeCount: 0, // 点赞数
    commentCount: 0, // 评论数
    content: ""
  },
  properties: {
    moment: Object
  },
  options: {
    styleIsolation: "apply-shared"
  },
  observers: {
    ["moment.isLike"](isLike) {
      this.setData({
        isLike
      });
    },
    ["moment.likeCount"](likeCount) {
      this.setData({
        likeCount
      });
    },
    ["moment.commentCount"](commentCount) {
      this.setData({
        commentCount
      });
    }
  },
  methods: {
    _setLoginShow() {
      this.setData({
        loginShow: true
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
      if (checkLogin()) {
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
              title: "操作失败",
              icon: "none"
            });
          });
      } else {
        this._setLoginShow();
      }
    },

    // 点击评论图标
    handleComment() {
      if (checkLogin()) {
        this.setData({
          commentShow: true
        });
      } else {
        this._setLoginShow();
      }
    },

    // 评论
    handleSubmit(event) {
      let {
        detail: {
          value: { content }
        }
      } = event;
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
      wx.cloud
        .callFunction({
          name: "community",
          data: {
            $url: "comment",
            comment
          }
        })
        .then(() => {
          const { commentCount } = this.data;
          this.setData({
            commentShow: false,
            content: "",
            commentCount: commentCount + 1
          });
          wx.hideLoading({
            complete: res => {
              if (res.errMsg == "hideLoading:ok") {
                wx.showToast({
                  title: "发表成功",
                  icon: "success"
                });
              }
            }
          });
        });
    }
  }
});
