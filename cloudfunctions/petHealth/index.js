// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const TcbRouter = require("tcb-router");
const moment = require("moment");

const db = cloud.database();
const petCollection = db.collection("pet");
const petRemindCollection = db.collection("pet_remind");
const healthProjectCollection = db.collection("health_project");
const petTimelineCollection = db.collection("pet_timeline");
const subMsgCollection = db.collection("SubscribeMessage");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });
  const DIFF = 8 * 60 * 60 * 1000; // 小程序云函数调用的时差

  // 获取所有项目列表
  app.router("/projectList/all", async ctx => {
    const { start = 0, count = 20 } = event;
    const { data: projectList } = await healthProjectCollection
      .skip(start)
      .limit(count)
      .get();
    ctx.body = projectList;
  });

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

  // 获取某个项目基本信息
  app.router("healthProject", async ctx => {
    const { projectId } = event;
    const { data: project } = await healthProjectCollection
      .doc(projectId)
      .get();
    ctx.body = project;
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

    ctx.body = result;
  });

  // 获取提醒项
  app.router("/remind/get", async (ctx, next) => {
    const { remindId } = event;
    const { data: remind } = await petRemindCollection.doc(remindId).get();
    const { petId, project, planTime, isReminded, remindTime } = remind;
    const { data: pet } = await petCollection.doc(petId).get();
    const formatTime = time => {
      const dateArr = time.split(" ")[0].split("-");
      return {
        year: dateArr[0],
        month: dateArr[1],
        day: dateArr[2]
      };
    };
    const result = {
      pet,
      project,
      isReminded,
      planTime: formatTime(planTime),
      remindTime: formatTime(remindTime)
    };
    ctx.body = result;
  });

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
        finishTime: "", // 完成时间
        _openid: OPENID,
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  // 删除提醒项
  app.router("/remind/delete", async (ctx, next) => {
    const { remindId } = event;
    await petRemindCollection.doc(remindId).remove();
    await subMsgCollection.where({ remindId }).remove();
  });

  // 完成提醒项
  app.router("/remind/finish", async (ctx, next) => {
    const { remindId, isReminded, finishTime } = event;
    // 未提醒已完成的情况（即提前完成）,需要解除订阅消息
    if (!isReminded) {
      await subMsgCollection.where({ remindId }).remove();
    }
    const result = await petRemindCollection.doc(remindId).update({
      data: {
        isFinished: true,
        finishTime
      }
    });
    ctx.body = result;
  });

  // 历史记录（时间轴）
  app.router("/timeline/add", async ctx => {
    const { remindId, pet = {} } = event;
    // 获取提醒项
    const { data: remind } = await petRemindCollection.doc(remindId).get();
    const { projectId, finishTime } = remind;
    // 正则提取完成时间的 年 月 日
    const date = moment(finishTime + DIFF).format("YYYY-M-D HH:mm");
    const temp = date.match(/\d+/g);
    // 获取项目基本信息
    const { data: healthProject } = await healthProjectCollection
      .doc(projectId)
      .get();
    // 时间轴的其他参数
    const { project, icon, color } = healthProject;
    const params = {
      project,
      icon,
      color
    };

    // 制定时间轴文字内容
    const { petName } = pet;
    let content = "";
    switch (project) {
      case "免疫":
      case "体检":
      case "驱虫":
        content = `今天主人带${petName}去${project}啦，身体更健康！`;
        break;
      case "剪毛":
        content = `今天主人帮${petName}${project}，现在身轻如燕！`;
        break;
      case "眼睛清洁":
        content = `今天主人帮${petName}${project}，眼睛Blink Blink的`;
        break;
      case "耳道清洁":
        content = `今天主人帮${petName}${project}，耳朵清爽极了`;
        break;
      case "洗澡":
        content = `今天主人帮${petName}${project}，整个body干干净净的~`;
        break;
      default:
        break;
    }
    const result = await petTimelineCollection.add({
      data: {
        pet,
        remindId,
        content,
        params,
        year: temp[0],
        date: `${temp[1]}月${temp[2]}日`,
        time: `${temp[3]}:${temp[4]}`,
        createTime: finishTime
      }
    });
    ctx.body = result;
  });

  // 获取时间轴
  app.router("/timeline/get", async ctx => {
    const { petId, start = 0, count = 10 } = event;
    const { data: timeline } = await petTimelineCollection
      .where({ pet: { _id: petId } })
      .skip(start)
      .limit(count)
      .orderBy("createTime", "desc")
      .get();
    ctx.body = timeline;
  });

  // 获取所有时间轴数据
  app.router("/timeline/all", async ctx => {
    const { start = 0, count = 10 } = event;
    const { OPENID } = wxContext;
    const { data: timeline } = await petTimelineCollection
      .where({ pet: { owner_id: OPENID } })
      .skip(start)
      .limit(count)
      .orderBy("createTime", "desc")
      .get();
    ctx.body = timeline;
  });

  return app.serve();
};
