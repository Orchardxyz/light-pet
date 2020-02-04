// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const notifCollection = db.collection("notification");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });
  const notify_type = {
    SYSTEM: "SYSTEM",
    LIKE: "LIKE",
    COMMENT_REPLY: "COMMENT_REPLY"
  };

  // 展示页
  // app.router('index', async (ctx, next) => {
  //   const { OPENID } = wxContext
  //   const result = await notifCollection.where({reciever_id: OPENID})
  // })

  /**
   * 发送通知
   * type: 0-系统通知, 1-点赞, 2-评论/回复;
   * action: 0-系统, 1-点赞, 2-评论, 3-回复...
   */
  app.router("send", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { reciever_id, sender = {}, action } = event;
    let type = "";
    let content = {};
    switch (action) {
      case 0:
        // TODO 系统通知
        const { SYSTEM } = notify_type;
        type = SYSTEM;
        content = {};
        break;
      case 1:
        const { LIKE } = notify_type;
        const { moment = {} } = event;
        type = LIKE;
        content = { moment };
        break;
      case 2 || 3:
        const { COMMENT_REPLY } = notify_type;
        const { moment = {}, comment = {} } = event;
        type = COMMENT_REPLY;
        content = { moment, comment };
        break;
      default:
        type = '';
        content = {};
    }
    await notifCollection.add({
      data: {
        reciever_id,
        content,
        type,
        action,
        sender: {
          ...sender,
          _openid: OPENID
        },
        isRead: false,
        createTime: db.serverDate()
      }
    });
  });

  return app.serve();
};
