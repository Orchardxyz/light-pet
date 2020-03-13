// 云函数入口文件
const cloud = require("wx-server-sdk");
const TcbRouter = require("tcb-router");

cloud.init();

const db = cloud.database();
const command = db.command;
const petTopicCollection = db.collection("pet_topic");
const topicCommentCollection = db.collection("topic_comment");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  // 排序类型
  const rankType = {
    COMPREHENSIVE: "COMPREHENSIVE",
    NEWEST: "NEWEST",
    MOST_COMMENT: "MOST_COMMENT",
    MOST_LIKE: "MOST_LIKE",
    MOST_VIEW: "MOST_VIEW"
  };

  // 获取数据
  app.router("getAll", async ctx => {
    const { type = rankType.COMPREHENSIVE, start = 0, count = 10 } = event;
    let result;
    switch (type) {
      case rankType.COMPREHENSIVE:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("likeCount", "desc")
          .orderBy("commentCount", "desc")
          .orderBy("viewCount", "desc")
          .get();
        break;
      case rankType.NEWEST:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("createTime", "desc")
          .get();
        break;
      case rankType.MOST_COMMENT:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("commentCount", "desc")
          .get();
        break;
      case rankType.MOST_LIKE:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("likeCount", "desc")
          .get();
        break;
      case rankType.MOST_VIEW:
        result = await petTopicCollection
          .skip(start)
          .limit(count)
          .orderBy("viewCount", "desc")
          .get();
        break;
      default:
        break;
    }
    const { data: topicList } = result;
    topicList.map(item => {
      item.enclosure = [];
      item.likes = [];
    });
    ctx.body = topicList;
  });

  // 获取某个话题详情
  app.router("detail", async ctx => {
    const { topicId } = event;
    const { OPENID } = wxContext;
    const { data: topic } = await petTopicCollection.doc(topicId).get();
    topic.isLike = topic.likes.includes(OPENID);
    ctx.body = topic;
  });

  // 增加浏览量
  app.router("/view/increase", async ctx => {
    const { topicId } = event;
    const result = await petTopicCollection.doc(topicId).update({
      data: {
        viewCount: command.inc(1)
      }
    });
    ctx.body = result;
  });

  // 发布话题
  app.router("publish", async ctx => {
    const { OPENID } = wxContext;
    const { topicObj } = event;
    const result = await petTopicCollection.add({
      data: {
        _openid: OPENID,
        ...topicObj,
        commentCount: 0,
        likeCount: 0,
        viewCount: 0, // 浏览量
        likes: [],
        stars: [],
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  // 点赞
  app.router("like", async ctx => {
    const { topicId } = event;
    const { OPENID } = wxContext;
    const result = await petTopicCollection.doc(topicId).update({
      data: {
        likes: command.push(OPENID),
        likeCount: command.inc(1)
      }
    });

    ctx.body = result;
  });

  // 取消赞
  app.router("unlike", async ctx => {
    const { topicId } = event;
    const { OPENID } = wxContext;
    const { data: topic } = await petTopicCollection.doc(topicId).get();
    const { likes } = topic;
    likes.splice(
      likes.findIndex(item => item === OPENID),
      1
    );
    const result = await petTopicCollection.doc(topicId).update({
      data: {
        likes,
        likeCount: command.inc(-1)
      }
    });

    ctx.body = result;
  });

  // 发表评论
  app.router("/comment/publish", async ctx => {
    const { OPENID } = wxContext;
    const {
      comment: { topicId, avatarUrl, nickName, content, type } = {}
    } = event;
    const result = await topicCommentCollection.add({
      data: {
        topicId,
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
    await petTopicCollection.doc(topicId).update({
      data: {
        commentCount: command.inc(1)
      }
    });

    ctx.body = result;
  });

  // 回复
  app.router("reply", async ctx => {
    const { OPENID } = wxContext;
    const {
      reply: {
        currentTopicId,
        currentCommentId,
        avatarUrl,
        nickName,
        content,
        type,
        replyUser = {}
      } = {}
    } = event;
    const result = await topicCommentCollection.doc(currentCommentId).update({
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
    await petTopicCollection.doc(currentTopicId).update({
      data: {
        commentCount: command.inc(1)
      }
    });

    ctx.body = result;
  });

  // 获取评论列表
  app.router("/comment/list", async ctx => {
    const { topicId, start = 0, count = 10, sortType = "asc" } = event;
    const { data: commentList = [] } = await topicCommentCollection
      .where({ topicId })
      .skip(start)
      .limit(count)
      .orderBy("createTime", sortType)
      .get();
    commentList.map(comment => {
      const { children } = comment;
      if (children.length > 2) {
        comment.children.splice(2);
        comment.isAll = false;
      } else {
        comment.isAll = true;
      }
    });
    ctx.body = commentList;
  });

  // 获取评论详情
  app.router("/comment/detail", async ctx => {
    const { commentId } = event;
    const { data: comment } = await topicCommentCollection.doc(commentId).get();
    ctx.body = comment;
  });

  return app.serve();
};
