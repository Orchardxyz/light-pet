// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const subMsgCollection = db.collection("SubscribeMessage");
const petRemindCollection = db.collection("pet_remind");

// 云函数入口函数
exports.main = async (event, context) => {
  const DIFF = 8 * 60 * 60 * 1000; // 小程序云函数调用的时差
  const timestampToTime = timestamp => {
    const date = new Date(timestamp + DIFF);
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const min =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${year}-${month}-${day} ${hour}:${min}`;
  };
  const currentTime = timestampToTime(Date.now());
  try {
    console.log('当前时间:', currentTime)
    const msgList = await subMsgCollection
      .where({
        done: false, // 未推送的订阅消息
        remindTime: currentTime // 提醒时间
      })
      .get();
    const sendPromises = msgList.data.map(async msg => {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: msg.touser,
          page: msg.page,
          data: msg.data,
          templateId: msg.templateId
        });
        await petRemindCollection.doc(msg.remindId).update({
          data: {
            isReminded: true
          }
        });
        return subMsgCollection.doc(msg._id).update({
          data: {
            done: true
          }
        });
      } catch (err) {
        console.log(err);
        return err;
      }
    });
    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
};
