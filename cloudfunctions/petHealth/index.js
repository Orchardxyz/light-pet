// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");
const moment = require("moment");

const db = cloud.database();
const petCollection = db.collection('pet')
const petRemindCollection = db.collection("pet_remind");
const healthProjectCollection = db.collection("health_project");
const subMsgCollection = db.collection("SubscribeMessage")

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });
  const DIFF = 8 * 60 * 60 * 1000; // 小程序云函数调用的时差

  // 获取对应提醒项目列表
  app.router("projectList", async (ctx, next) => {
    const { petId, species } = event;
    const { data: healthProjects = [] } = await healthProjectCollection
      .where({ species })
      .get();
    const { data: remindProjects = [] } = await petRemindCollection
      .where({ petId, isFinished: false })
      .get();
    // 获取其中的project Id集
    const remindProjectIds = [];
    // remindId集
    const remindIds = [];
    remindProjects.map(({ _id, projectId = "" }) => {
      remindProjectIds.push(projectId);
      remindIds.push(_id);
    });
    healthProjects.map(project => {
      if (remindProjectIds.includes(project._id)) {
        // 用来给前端判断是否已经设置的字段
        project.hasSet = true;
        project.remindId =
          remindIds[remindProjectIds.findIndex(value => value === project._id)];
      } else {
        project.hasSet = false;
      }
    });

    ctx.body = healthProjects;
  });

  app.router("project", async (ctx, next) => {
    const { petId, projectId } = event;
    const { data: healthProjects = [] } = await healthProjectCollection
      .where({ _id: projectId })
      .get();
    const result = healthProjects[0];
    const { data: petProjects = [] } = await petRemindCollection
      .where({ petId, projectId, isReminded: true })
      .limit(1)
      .orderBy("createTime", "desc")
      .get();
    // 如果找到记录，说明有上次设置并且已完成的提醒时间
    if (petProjects.length > 0) {
      result.lastTime = petProjects[0].remindTime.split(" ")[0];
    }
    // 明日日期
    const tomorrow = moment(Date.now() + DIFF)
      .add(1, "days")
      .format("YYYY-MM-DD");
    result.tomorrow = tomorrow;

    ctx.body = result;
  });

  // 获取提醒项
  app.router("/remind/get", async (ctx, next) => {
    const { remindId } = event
    const { data: remind } = await petRemindCollection.doc(remindId).get()
    const { petId, project, planTime, isReminded, remindTime } = remind
    const { data: pet} = await petCollection.doc(petId).get()
    const formatTime = time => {
      const dateArr = time.split(' ')[0].split('-')
      return {
        year: dateArr[0],
        month: dateArr[1],
        day: dateArr[2]
      }
    }
    const result = {
      pet,
      project,
      isReminded,
      planTime: formatTime(planTime),
      remindTime: formatTime(remindTime)
    }
    ctx.body = result
  })

  // 添加提醒项
  app.router("/remind/add", async (ctx, next) => {
    const { OPENID } = wxContext;
    const {
      petId,
      petName,
      projectId,
      project,
      remindDay = 0,
      planTime,
      planClock = "10:00",
      species
    } = event;
    const result = await petRemindCollection.add({
      data: {
        petId,
        petName,
        projectId,
        project,
        species,
        remindTime: `${moment(planTime)
          .subtract(remindDay, "days")
          .format("YYYY-MM-DD")} ${planClock}`,
        planTime: `${planTime} ${planClock}`,
        isReminded: false,
        isFinished: false, // 是否已完成
        finishTime: '', // 完成时间
        _openid: OPENID,
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  // 删除提醒项
  app.router('/remind/delete', async (ctx, next) => {
    const { remindId } = event
    await petRemindCollection.doc(remindId).remove()
    await subMsgCollection.where({remindId}).remove()
  })

  // 完成提醒项
  app.router('/remind/finish', async (ctx, next) => {
    const { remindId, isReminded } = event
    // 未提醒已完成的情况（即提前完成）,需要解除订阅消息
    if (!isReminded) {
      await subMsgCollection.where({remindId}).remove()
    }
    const result = await petRemindCollection.doc(remindId).update({
      data: {
        isFinished: true,
        finishTime: db.serverDate(),
      }
    })
    ctx.body = result
  })

  return app.serve();
};
