// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const petCollection = db.collection("pet");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  // 获取所有宠物
  app.router("list", async (ctx, next) => {
    const { OPENID } = wxContext;
    const result = await petCollection
      .where({
        owner_id: OPENID
      })
      .get();
    ctx.body = result;
  });

  // 获取宠物信息
  app.router('get', async (ctx, next) => {
    const { petId } = event
    const result = await petCollection.doc(petId).get()
    ctx.body = result
  })

  // 添加宠物
  app.router("add", async (ctx, next) => {
    const { OPENID } = wxContext;
    const {
      petName,
      petAvatar,
      sex,
      birthday,
      adoptTime,
      species,
      variety
    } = event;
    const result = await petCollection.add({
      data: {
        petName,
        petAvatar,
        sex,
        birthday,
        adoptTime,
        species,
        variety,
        owner_id: OPENID,
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  return app.serve();
};
