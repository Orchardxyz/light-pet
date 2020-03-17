import { COMMENT } from "../../../utils/commentType";
import notify from "../../../utils/notify/notify";
import { LIKE, COMMENT_REPLY } from "../../../utils/notify/notifyType";
import notifyAction from "../../../utils/notify/notifyAction";
import msgCheck from "../../../utils/security/msgCheck";
import secWarn from "../../../utils/security/secWarn";

const app = getApp();

let content = "";

Component({
  data: {
    loginShow: false,
    commentShow: false,
    footerBottom: 0,
    wordNum: 0,
    MAX_COUNT: 200
  },
  properties: {
    moment: Object
  },
  options: {
    styleIsolation: "apply-shared"
  },
  methods: {
    _setLoginShow() {
      this.setData({
        loginShow: true
      });
    },

    closeCommentDialog() {
      this.setData({
        commentShow: false,
        wordNum: 0
      });
      content = ''
    },

    handleInput(event) {
      const {
        detail: { value }
      } = event;
      content = value;
      this.setData({
        wordNum: value.length
      });
    },

    // 点赞功能
    handleClickLike() {
      if (app.isLogin()) {
        const {
          moment: {
            _id: momentId,
            _openid,
            nickName,
            content,
            img = [],
            isLike,
            likeCount
          }
        } = this.data;
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
              ["moment.likeCount"]: isLike ? likeCount - 1 : likeCount + 1,
              ["moment.isLike"]: !isLike
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
    submitComment() {
      if (content.trim() === "") {
        wx.showModal({
          title: "评论内容不能为空!"
        });
        return;
      }
      wx.showLoading({
        title: "提交中"
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
        } = this.data;
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
            const {
              moment: { commentCount }
            } = this.data;
            content = "";
            this.setData({
              commentShow: false,
              ["moment.commentCount"]: commentCount + 1
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
