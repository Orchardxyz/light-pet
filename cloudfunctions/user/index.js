// 云函数入口文件
const cloud = require("wx-server-sdk");
const TcbRouter = require("tcb-router");

cloud.init();

const db = cloud.database();
const petCollection = db.collection("pet");
const momentCollection = db.collection("moments");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  app.router("getPetNum", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { data: petList } = await petCollection
      .where({ owner_id: OPENID })
      .get();
    ctx.body = petList.length;
  });

  app.router("diary", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { data: momentList } = await momentCollection
      .where({ _openid: OPENID })
      .get();
    momentList.map(moment => {
      const { likes, stars } = moment;
      moment.isLike = likes.includes(OPENID);
      moment.isStar = stars.includes(OPENID);
    });
    ctx.body = momentList;
  });

  app.router("getStarMoment", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { start = 0, count = 10 } = event;
    const { data: momentList } = await momentCollection
      .where({
        stars: OPENID
      })
      .skip(start)
      .limit(count)
      .get();
    momentList.map(moment => {
      moment.isStar = true;
      const { likes } = moment;
      moment.isLike = likes.includes(OPENID);
    });
    ctx.body = momentList;
  });

  app.router("getLikeMoment", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { start = 0, count = 10 } = event;
    const { data: momentList } = await momentCollection
      .where({
        likes: OPENID
      })
      .skip(start)
      .limit(count)
      .get();
    momentList.map(moment => {
      moment.isLike = true;
      const { stars } = moment;
      moment.isStar = stars.includes(OPENID);
    });
    ctx.body = momentList;
  });

  // 分享（生成二维码）
  app.router("share", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { buffer } = await cloud.openapi.wxacode.getUnlimited({
      scene: OPENID
    });
    const { fileID } = await cloud.uploadFile({
      cloudPath: `qrcode/${Date.now()}-${Math.random() * 1000000}.png`,
      fileContent: buffer
    });
    ctx.body = fileID;
  });

  return app.serve();
};
