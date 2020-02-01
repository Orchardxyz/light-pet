// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require("tcb-router");

const db = cloud.database();
const command = db.command;
const momentCollection = db.collection("moments");
const commentCollection = db.collection("comment");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({ event });
  
  // 评论详情
  app.router('detail', async(ctx, next) => {
    const { commentId } = event
    const result = await commentCollection.doc(commentId).get()
    ctx.body = result
  })

  // 添加回复
  app.router("reply", async (ctx, next) => {
    const { OPENID } = wxContext;
    const {
      reply: {
        currentMomentId,
        currentCommentId,
        avatarUrl,
        nickName,
        content,
        type,
        replyUser = {}
      } = {}
    } = event;
    const result = await commentCollection.doc(currentCommentId).update({
      data: {
        children: command.push({
          avatarUrl,
          nickName,
          content,
          type,
          replyUser,
          _openid: OPENID,
          createTime: db.serverDate()
        })
      }
    });
    // 评论数增加1
    await momentCollection.doc(currentMomentId).update({
      data: {
        commentCount: command.inc(1)
      }
    });

    ctx.body = result;
  });

  return app.serve()
}