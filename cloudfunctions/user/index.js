// 云函数入口文件
const cloud = require("wx-server-sdk");
const TcbRouter = require("tcb-router");

cloud.init();

const db = cloud.database();
const petCollection = db.collection("pet");
const starCollection = db.collection("star");

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

  app.router("getStarMoment", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { data: starList } = await starCollection
      .where({ _openid: OPENID })
      .get();
    ctx.body = starList;
  });

  // 分享（生成二维码）
  app.router('share', async (ctx, next) => {
    const { OPENID } = wxContext
    const { buffer } = await cloud.openapi.wxacode.getUnlimited({
      scene: OPENID
    })
    const { fileID } = await cloud.uploadFile({
      cloudPath: `qrcode/${Date.now()}-${Math.random() * 1000000}.png`,
      fileContent: buffer
    }) 
    ctx.body = fileID
  })

  return app.serve();
};
