// 云函数入口文件
const cloud = require("wx-server-sdk");
const moment = require("moment");

cloud.init();

const db = cloud.database();
const petRemindCollection = db.collection("pet_remind");
const SubMsgCollection = db.collection("SubscribeMessage");

// 云函数入口函数
exports.main = async (event, context) => {
  const DIFF = 8 * 60 * 60 * 1000; // 小程序云函数调用的时差
  const today = moment(Date.now() + DIFF).format("YYYY-MM-DD");
  // 获取已过了计划时间但却没有按时完成的提醒事项
  const { data: remindList } = await petRemindCollection.where({
    isFinished: false,
    isReminded: true,
    planTime: db.command.lt(today)
  }).get()
  const promise = remindList.map(async ({ _id: remindId, remindTime, species }) => {
    try {
      const remindClock = remindTime.split(' ')[1]
      await SubMsgCollection.where({remindId}).update({
        remindTime: `${today} ${remindClock}`,
        done: false
      })
    } catch (err) {
      console.log(err);
      return err;
    }
  });
  return Promise.all(promise)
};
