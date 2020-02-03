// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const command = db.command;
const momentCollection = db.collection("moments");
const commentCollection = db.collection("comment");

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });

  // 获取社区所有动态
  app.router("getAllMomentList", async (ctx, next) => {
    const { keyword = "", start, count } = event;
    // 会出现进入路由时OPENID还没有读到的情况，所以要在这里先执行一次
    const { OPENID } = cloud.getWXContext();
    let condition = {};
    // 支持模糊查询
    if (keyword.trim() !== "") {
      condition = {
        content: db.RegExp({
          regexp: keyword,
          options: "i"
        })
      };
    }
    let momentList = await momentCollection
      .where(condition)
      .skip(start)
      .limit(count)
      .orderBy("createTime", "desc")
      .get()
      .then(res => {
        return res.data;
      });
    for (let i = 0; i < momentList.length; i += 1) {
      const { likes = [] } = momentList[i];
      const isLike = likes.includes(OPENID);
      momentList[i] = {
        ...momentList[i],
        isLike,
        likeCount: likes.length
      };
    }
    ctx.body = momentList;
  });

  // 获取关注的好友动态（包括自己）
  app.router("getFllowingMomentList", async (ctx, next) => {
    // TODO
  });

  // 获取动态详情
  app.router("/moment/detail", async (ctx, next) => {
    const { momentId = "" } = event;
    const detail = await momentCollection.doc(momentId).get();
    const comment = await commentCollection
      .where({ momentId })
      .orderBy("createTime", "asc")
      .limit(1)
      .get();
    ctx.body = {
      detail,
      comment
    };
  });

  // 添加动态到数据库中
  app.router("addMoment", async (ctx, next) => {
    const { OPENID } = cloud.getWXContext();
    const moment = event.moment;
    const result = await momentCollection.add({
      data: {
        _openid: OPENID,
        ...moment,
        createTime: db.serverDate()
      }
    });
    return result;
  });

  // 点赞
  app.router("giveLike", async (ctx, next) => {
    const { momentId } = event;
    const { OPENID } = cloud.getWXContext();
    let condition = {
      _id: momentId
    };
    const data = await momentCollection
      .where(condition)
      .get()
      .then(res => res.data);
    let likes = data[0].likes;
    likes.push(OPENID);
    const result = await momentCollection.where(condition).update({
      data: { likes }
    });

    return result;
  });

  // 取消点赞
  app.router("cancelLike", async (ctx, next) => {
    const { momentId } = event;
    const { OPENID } = cloud.getWXContext();
    let condition = {
      _id: momentId
    };
    const data = await momentCollection
      .where(condition)
      .get()
      .then(res => res.data);
    let likes = data[0].likes;
    likes.splice(
      likes.findIndex(item => item === OPENID),
      1
    );
    const result = await momentCollection.where(condition).update({
      data: { likes }
    });

    return result;
  });

  // 添加评论c
  app.router("comment", async (ctx, next) => {
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

  // 添加回复
  app.router("reply", async (ctx, next) => {
    const { OPENID } = cloud.getWXContext();
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

  return app.serve();
};
