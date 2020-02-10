// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require("tcb-router");

const db = cloud.database();
const petHealthCollection = db.collection("pet_health");
const healthProjectCollection = db.collection('health_project')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({event})

  // 获取对应提醒项目列表
  app.router('projectList', async (ctx, next) => {
    const { petId, species } = event
    const { data: healthProjects = []} = await healthProjectCollection.where({species}).get()
    const { data: petProjects = []} = await petHealthCollection.where({petId}).get()
    // 获取其中的project Id集
    const petProjectIds = []
    petProjects.map(({projectId = ''}) => {
      petProjectIds.push(projectId)
    })
    healthProjects.map(project => {
      if (petProjectIds.includes[project._id]) {
        // 用来给前端判断是否已经设置的字段
        project.hasSet = true
      } else {
        project.hasSet = false
      }
    })

    ctx.body = healthProjects
  })

  return app.serve()
}