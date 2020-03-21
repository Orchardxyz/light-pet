// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const notifyCollection = db.collection("notification");
const petTopicCollection = db.collection("pet_topic");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });
  const notify_type = {
    SYSTEM: "SYSTEM",
    LIKE: "LIKE",
    STAR: "STAR",
    COMMENT_REPLY: "COMMENT_REPLY",
    TOPIC_LIKE: "TOPIC_LIKE",
    TOPIC_COMMENT_REPLY: "TOPIC_COMMENT_REPLY",
    TOPIC_STAR: "TOPIC_STAR"
  };

  // 展示页
  app.router("index", async (ctx, next) => {
    const { OPENID } = wxContext;
    const {
      SYSTEM,
      LIKE,
      STAR,
      COMMENT_REPLY,
      TOPIC_LIKE,
      TOPIC_COMMENT_REPLY
    } = notify_type;
    const condition = { reciever_id: OPENID, isRead: false };
    const { total } = await notifyCollection.where({ ...condition }).count();
    const { total: system } = await notifyCollection
      .where({ ...condition, type: SYSTEM })
      .count();
    const { total: like } = await notifyCollection
      .where({ ...condition, type: LIKE })
      .count();
    const { total: star } = await notifyCollection
      .where({ ...condition, type: STAR })
      .count();
    const { total: comment_reply } = await notifyCollection
      .where({ ...condition, type: COMMENT_REPLY })
      .count();
    const { total: topic_like } = await notifyCollection
      .where({ ...condition, type: TOPIC_LIKE })
      .count();
    const { total: topic_comment_reply } = await notifyCollection
      .where({ ...condition, type: TOPIC_COMMENT_REPLY })
      .count();

    ctx.body = {
      total,
      system,
      like,
      star,
      comment_reply,
      topic_like,
      topic_comment_reply
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

  app.router("/topic/get", async ctx => {
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
