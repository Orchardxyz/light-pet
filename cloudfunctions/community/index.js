// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const command = db.command;
const momentCollection = db.collection("moments");
const commentCollection = db.collection("comment");
const notifyCollection = db.collection("notification");

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });

  // 获取社区所有动态
  app.router("getAllMomentList", async (ctx, next) => {
    const { keyword = "", start = 0, count = 10 } = event;
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
      const { _openid, likes = [], stars = [] } = momentList[i];
      const isLike = likes.includes(OPENID);
      const isStar = stars.includes(OPENID);
      const isOwner = _openid === OPENID;
      momentList[i] = {
        ...momentList[i],
        isLike,
        isStar,
        isOwner
      };
    }
    ctx.body = momentList;
  });

  // 获取某条动态
  app.router("/moment/get", async (ctx, next) => {
    const { momentId } = event;
    const { data: moment } = await momentCollection.doc(momentId).get();
    ctx.body = moment;
  });

  // 获取动态详情
  app.router("/moment/detail", async (ctx, next) => {
    const { momentId = "", start = 0, count = 10 } = event;
    let { data: moment } = await momentCollection.doc(momentId).get();
    const { data: commentList } = await commentCollection
      .where({ momentId })
      .skip(start)
      .orderBy("createTime", "asc")
      .limit(count)
      .get();
    const { _openid, likes = [], stars = [] } = moment;
    const { OPENID } = cloud.getWXContext();
    moment.isLike = likes.includes(OPENID);
    moment.isStar = stars.includes(OPENID);
    moment.isOwner = _openid === OPENID;
    ctx.body = {
      moment,
      commentList
    };
  });

  // 添加动态到数据库中
  app.router("addMoment", async (ctx, next) => {
    const { OPENID } = cloud.getWXContext();
    const { moment } = event;
    const result = await momentCollection.add({
      data: {
        _openid: OPENID,
        ...moment,
        commentCount: 0,
        likeCount: 0,
        likes: [],
        stars: [],
        createTime: db.serverDate()
      }
    });
    return result;
  });

  // 删除动态
  app.router("deleteMoment", async (ctx, nect) => {
    const { momentId } = event;
    try {
      await momentCollection.doc(momentId).remove();
      await commentCollection.where({ momentId }).remove();
      await notifyCollection
        .where({
          source_params: { momentId }
        })
        .remove();
    } catch (err) {
      console.log(err);
      ctx.body = err;
    }
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
    // 点赞数增加1
    await momentCollection.doc(momentId).update({
      data: {
        likeCount: command.inc(1)
      }
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
    // 点赞数减1
    await momentCollection.doc(momentId).update({
      data: {
        likeCount: command.inc(-1)
      }
    });

    return result;
  });

  // 收藏
  app.router("star", async (ctx, next) => {
    const { OPENID } = cloud.getWXContext();
    const { moment = {} } = event;
    try {
      const { _id } = moment;
      const resMoment = await momentCollection.doc(_id).update({
        data: {
          stars: command.push(OPENID)
        }
      });
      ctx.body = {
        resMoment
      };
    } catch (err) {
      console.log(err);
      ctx.body = err;
    }
  });

  // 取消收藏
  app.router("unstar", async (ctx, next) => {
    const { OPENID } = cloud.getWXContext();
    const { momentId } = event;
    try {
      const { data } = await momentCollection.doc(momentId).get();
      const { stars } = data;
      stars.splice(
        stars.findIndex(item => item === OPENID),
        1
      );
      const resMoment = await momentCollection.doc(momentId).update({
        data: {
          stars
        }
      });
      ctx.body = {
        resMoment
      };
    } catch (err) {
      console.log(err);
      ctx.body = err;
    }
  });

  // 添加评论
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
