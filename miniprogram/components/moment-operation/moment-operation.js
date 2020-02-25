import { COMMENT } from "../../utils/commentType";
import notify from "../../utils/notify/notify";
import { LIKE, COMMENT_REPLY } from "../../utils/notify/notifyType";
import notifyAction from "../../utils/notify/notifyAction";
import msgCheck from "../../utils/security/msgCheck";
import secWarn from "../../utils/security/secWarn";

const app = getApp();

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
    handleBlur() {
      this.setData({
        footerBottom: 0
      });
    },

    // 点赞功能
    handleClickLike() {
      if (app.isLogin()) {
        const { isLike, likeCount } = this.data;
        const {
          moment: { _id: momentId, _openid, nickName, content, img = [] }
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
            if (!isLike) {
              const _img = img.length > 0 ? img[0] : "";
              notify(
                _openid,
                nickName,
                LIKE,
                notifyAction.GIVE_LIKE,
                { momentId },
                content,
                _img
              );
            }
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
      if (app.isLogin()) {
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
      if (msgCheck(content)) {
        const {
          moment: {
            _id: momentId,
            _openid,
            nickName: reciever_name,
            img = [],
            content: _content
          }
        } = this.properties;
        const userInfo = app.getUserInfo();
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
                  const _img = img.length > 0 ? img[0] : "";
                  notify(
                    _openid,
                    reciever_name,
                    COMMENT_REPLY,
                    notifyAction.COMMENT,
                    { momentId },
                    _content,
                    _img,
                    content
                  );
                }
              }
            });
          });
      } else {
        wx.hideLoading();
        secWarn("msg");
        return;
      }
    }
  }
});
