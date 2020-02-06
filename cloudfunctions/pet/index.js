// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()
const petCollection = db.collection('pet')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({event})

  // 添加宠物
  app.router('add', async (ctx, next) => {
    const { OPENID } = wxContext
    const { petName, petAvatar, sex, birthday, adoptTime, species, variety } = event
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
    })
    ctx.body = result
  })

  return app.serve()
}