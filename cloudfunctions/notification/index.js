// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const notifyCollection = db.collection("notification");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });
  const notify_type = {
    SYSTEM: "SYSTEM",
    LIKE: "LIKE",
    STAR: "STAR",
    COMMENT_REPLY: "COMMENT_REPLY"
  };

  // 展示页
  app.router("index", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { SYSTEM, LIKE, STAR, COMMENT_REPLY } = notify_type;
    const condition = { reciever_id: OPENID, isRead: false };
    const { data: total } = await notifyCollection
      .where({ ...condition })
      .get();
    const { data: system } = await notifyCollection
      .where({ ...condition, type: SYSTEM })
      .get();
    const { data: like } = await notifyCollection
      .where({ ...condition, type: LIKE })
      .get();
    const { data: star } = await notifyCollection
      .where({ ...condition, type: STAR })
      .get();
    const { data: comment_reply } = await notifyCollection
      .where({ ...condition, type: COMMENT_REPLY })
      .get();
    ctx.body = {
      total: total.length,
      system: system.length,
      like: like.length,
      star: star.length,
      comment_reply: comment_reply.length
    };
  });

  /**
   * 发送通知
   * type: 0-系统通知, 1-点赞, 2-评论/回复, 3-收藏;
   * action: 0-系统, 1-点赞, 2-评论, 3-回复...
   */
  app.router("send", async (ctx, next) => {
    const { OPENID } = wxContext;
    const {
      reciever_id = "",
      reciever_name = "",
      source_params = {},
      sender = {},
      notify_content = "",
      action,
      content,
      img = "",
      type
    } = event;
    if (reciever_id === OPENID) {
      return;
    }
    await notifyCollection.add({
      data: {
        reciever_id,
        reciever_name,
        source_params,
        notify_content,
        content,
        img,
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

  // 获取相应类型的通知
  app.router("get", async (ctx, next) => {
    const { type, start = 0, count = 10 } = event;
    const { OPENID } = wxContext;
    const { data: notifyList = [] } = await notifyCollection
      .where({ type, reciever_id: OPENID })
      .skip(start)
      .limit(count)
      .orderBy("createTime", "desc")
      .get();
    ctx.body = notifyList;
  });

  // 已读
  app.router("read", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { type } = event;
    const result = await notifyCollection
      .where({ reciever_id: OPENID, type, isRead: false })
      .update({
        data: {
          isRead: true
        }
      });
    ctx.body = result;
  });

  return app.serve();
};
