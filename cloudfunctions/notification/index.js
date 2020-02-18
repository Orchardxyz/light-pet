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
    const {
      reciever_id = "",
      source_id = "",
      sender = {},
      action,
      content,
      content_type,
      type
    } = event;
    if (reciever_id === OPENID) {
      return;
    }
    await notifCollection.add({
      data: {
        reciever_id,
        source_id,
        content,
        content_type,
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
