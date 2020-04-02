// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const TcbRouter = require("tcb-router");

const db = cloud.database();
const command = db.command;
const momentCollection = db.collection("moments");
const commentCollection = db.collection("comment");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  // 评论列表
  app.router("list", async (ctx, next) => {
    const { momentId = "", start = 0, count = 10 } = event;
    const { data: commentList } = await commentCollection
      .where({ momentId })
      .skip(start)
      .orderBy("createTime", "asc")
      .limit(count)
      .get();
    commentList.map(comment => {
      const { children = [] } = comment;
      if (children.length > 2) {
        comment.isAll = false;
        comment.children.splice(2)
      } else {
        comment.isAll = true;
      }
    });
    ctx.body = commentList;
  });

  // 评论详情
  app.router("detail", async (ctx, next) => {
    const { commentId } = event;
    const result = await commentCollection.doc(commentId).get();
    ctx.body = result;
  });

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

  // 添加评论
  app.router("add", async (ctx, next) => {
    const { OPENID } = cloud.getWXContext();
    const {
      comment: { momentId, avatarUrl, nickName, content, type } = {}
    } = event;
    const result = await commentCollection.add({
      data: {
        momentId,
        avatarUrl,
        nickName,
        content,
        type,
        _openid: OPENID,
        children: [],
        createTime: db.serverDate()
      }
    });
    // 评论数增加1
    await momentCollection.doc(momentId).update({
      data: {
        commentCount: command.inc(1)
      }
    });

    ctx.body = result;
  });

  return app.serve();
};
