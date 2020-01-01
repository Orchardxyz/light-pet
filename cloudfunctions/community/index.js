// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()
const momentCollection = db.collection('moments')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  // 获取社区所有动态
  app.router('getAllMomentList', async(ctx, next) => {
    const { keyword = '', start, count } = event
    let condition = {}
    // 支持模糊查询
    if (keyword.trim() !== '') {
      condition = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i',
        })
      }
    }
    let momentList = await momentCollection.where(condition).skip(start)
    .limit(count).orderBy('createTime', 'desc').get().then(res => {
      return res.data
    })
    ctx.body = momentList
  })

  // 获取关注的好友动态（包括自己）
  app.router('getFllowingMomentList', async(ctx, next) => {
    // TODO
  })

  // 添加动态到数据库中
  app.router('addMoment', async(ctx, next) => {
    // 获取openid
    const wxContext = cloud.getWXContext()
    const { OPENID } = wxContext
    const moment = event.moment
    const result = await db.collection('moments').add({
      data: {
        _openid: OPENID,
        ...moment,
        createTime: db.serverDate(),
      }
    })
    return result
  })

  return app.serve()
}