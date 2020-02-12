// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");
const moment = require("moment");

const db = cloud.database();
const petRemindCollection = db.collection("pet_remind");
const healthProjectCollection = db.collection("health_project");

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
    const { data: petProjects = [] } = await petRemindCollection
      .where({ petId })
      .get();
    // 获取其中的project Id集
    const petProjectIds = [];
    petProjects.map(({ projectId = "" }) => {
      petProjectIds.push(projectId);
    });
    healthProjects.map(project => {
      if (petProjectIds.includes[project._id]) {
        // 用来给前端判断是否已经设置的字段
        project.hasSet = true;
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
      .where({ petId, isReminded: true })
      .limit(1)
      .orderBy("createTime", "desc")
      .get();
    // 如果找到记录，说明有上次设置并且已完成的提醒时间
    if (petProjects.length > 0) {
      result.lastTime = petProjects[0].remindTime;
    }
    // 明日日期
    const tomorrow = moment(Date.now() + DIFF)
      .add(1, "days")
      .format("YYYY-MM-DD");
    result.tomorrow = tomorrow;

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
          .format("YYYY年M月D日")} ${planClock}`,
        planTime: `${moment(planTime).format("YYYY年M月D日")} ${planClock}`,
        isReminded: false,
        _openid: OPENID,
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  return app.serve();
};
