// 云函数入口文件
const cloud = require("wx-server-sdk");
const TcbRouter = require("tcb-router");

cloud.init();

const db = cloud.database();
const petTopicCollection = db.collection("pet_topic");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  // 排序类型
  const rankType = {
    COMPREHENSIVE: "COMPREHENSIVE",
    NEWEST: "NEWEST",
    MOST_COMMENT: "MOST_COMMENT",
    MOST_LIKE: "MOST_LIKE",
    MOST_VIEW: "MOST_VIEW"
  };

  // 获取数据
  app.router("getAll", async ctx => {
    const { type = rankType.COMPREHENSIVE, start = 0, count = 10 } = event;
    let result;
    switch (type) {
      case rankType.COMPREHENSIVE:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("likeCount", "desc")
          .orderBy("commentCount", "desc")
          .orderBy("viewCount", "desc")
          .get();
        break;
      case rankType.NEWEST:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("createTime", "desc")
          .get();
      case rankType.MOST_COMMENT:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("commentCount", "desc")
          .get();
      case rankType.MOST_LIKE:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("likeCount", "desc")
          .get();
      case rankType.MOST_VIEW:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("viewCount", "desc")
          .get();
      default:
        break;
    }
    ctx.body = result;
  });

  // 发布话题
  app.router("publish", async ctx => {
    const { OPENID } = wxContext;
    const { topicObj } = event;
    const result = await petTopicCollection.add({
      data: {
        _openid: OPENID,
        ...topicObj,
        commentCount: 0,
        likeCount: 0,
        viewCount: 0, // 浏览量
        likes: [],
        stars: [],
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  return app.serve();
};
