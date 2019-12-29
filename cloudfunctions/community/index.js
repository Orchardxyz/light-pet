// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()
const momentsCollection = db.collection('moments')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  // 获取社区所有动态
  app.router('getMomentsList', async(ctx, next) => {

  })

  // 添加动态到数据库中
  // app.router('addMoment', async(ctx, next) => {
  //   const moment = event.moment
  //   const result = await db.collection('moments').add({
  //     data: {
  //       ...moment,
  //       createTime: db.serverDate(),
  //     }
  //   })
  //   return result
  // })

  return app.serve()
}