// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const TcbRouter = require("tcb-router");

const db = cloud.database();
const petCollection = db.collection("pet");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const app = new TcbRouter({ event });

  const ChineseBits = [
    "",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九"
  ];
  const ChineseTenHundred = ["", "十", "百"];

  // 获取宠物年龄
  const getAge = date => {
    const birthday = Date.parse(new Date(date));
    const today = Date.parse(new Date());
    if (today - birthday < 0) {
      new Error("Birthday Error: Birthday is not bound to later than today!");
    }
    const days = Math.ceil((today - birthday) / (24 * 60 * 60 * 1000));
    const day = Math.floor((days % 365) % 30);
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    let age = "";
    // 年
    if (years > 0 && years < 10) {
      age += `${years === 2 ? '两' : ChineseBits[years]}岁`;
    } else if (years >= 10) {
      age += `${ChineseTenHundred[years / 10 >> 0]}${ChineseBits[years % 10]}岁`;
    } else {
      age += '零岁'
    }
    // 月
    if (months > 0 && months < 10) {
      age +=
        years > 0
          ? `零${months === 2 ? '两' : ChineseBits[months]}个月`
          : `${months === 2 ? '两' : ChineseBits[months]}个月`;
    } else if (months >= 10) {
      age += `${ChineseTenHundred[months / 10 >> 0]}${ChineseBits[months % 10]}个月`;
    }
    // 日
    if (day > 0 && day < 10) {
      age +=
        months > 0 || years > 0
          ? `零${day === 2 ? '两' : ChineseBits[day]}天`
          : `${day === 2 ? '两' : ChineseBits[day]}天`;
    } else if (day >= 10) {
      age += `${ChineseTenHundred[day / 10 >> 0]}${ChineseBits[day % 10]}天`;
    }
    return age;
  };

  // 获取宠物陪伴时长
  getCompanyDays = startTime => {
    const adoptTime = Date.parse(new Date(startTime));
    const today = Date.parse(new Date());
    if (today - adoptTime < 0) {
      new Error("Birthday Error: Birthday is not bound to later than today!");
    }
    const days = Math.ceil((today - adoptTime) / (24 * 60 * 60 * 1000));
    return days;
  };

  // 获取所有宠物
  app.router("list", async (ctx, next) => {
    const { OPENID } = wxContext;
    const result = await petCollection
      .where({
        owner_id: OPENID
      })
      .get();
    ctx.body = result;
  });

  // 获取所有宠物（包括年龄等细节）
  app.router("/list/detail", async (ctx, next) => {
    const { OPENID } = wxContext;
    const { data: petList = [] } = await petCollection
      .where({
        owner_id: OPENID
      })
      .get();
    petList.map(pet => {
      const { adoptTime = "", birthday = '', createTime } = pet;
      pet.companyDays = !adoptTime
        ? getCompanyDays(createTime)
        : getCompanyDays(adoptTime);
      pet.age = getAge(birthday)
    });
    ctx.body = petList;
  });

  // 获取宠物信息
  app.router("get", async (ctx, next) => {
    const { petId } = event;
    const result = await petCollection.doc(petId).get();
    ctx.body = result;
  });

  // 添加宠物
  app.router("add", async (ctx, next) => {
    const { OPENID } = wxContext;
    const {
      petName,
      petAvatar,
      sex,
      birthday,
      adoptTime,
      species,
      variety
    } = event;
    const result = await petCollection.add({
      data: {
        petName,
        petAvatar,
        sex,
        birthday,
        adoptTime,
        species,
        variety,
        owner_id: OPENID,
        createTime: db.serverDate()
      }
    });
    ctx.body = result;
  });

  return app.serve();
};
