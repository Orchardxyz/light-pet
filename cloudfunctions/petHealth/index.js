// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");
const moment = require('moment')

const db = cloud.database();
const petHealthCollection = db.collection("pet_health");
const healthProjectCollection = db.collection("health_project");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  // 获取对应提醒项目列表
  app.router("projectList", async (ctx, next) => {
    const { petId, species } = event;
    const { data: healthProjects = [] } = await healthProjectCollection
      .where({ species })
      .get();
    const { data: petProjects = [] } = await petHealthCollection
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
    const result = healthProjects[0]
    const { data: petProjects = [] } = await petHealthCollection
      .where({ petId, isReminded: true })
      .limit(1)
      .orderBy("createTime", "desc")
      .get();
    // 如果找到记录，说明有上次设置并且已完成的提醒时间
    if (petProjects.length > 0) {
      result.lastTime = petProjects[0].remindTime
    }
    // 今日日期
    const today = moment(Date.now()).format("YYYY-MM-DD")
    result.today = today

    ctx.body = result;
  });

  return app.serve();
};
