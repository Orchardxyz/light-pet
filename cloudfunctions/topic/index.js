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
