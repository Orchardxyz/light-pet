// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();
const subscribeMessageCollection = db.collection("SubscribeMessage");
const petRemindCollection = db.collection("pet_remind");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  const { remindId, templateId } = event;
  const remind = await petRemindCollection.doc(remindId).get();
  const {
    data: { petName, species, project, planTime, remindTime }
  } = remind;
  const note = `快带你的${species}去小程序记录下这一刻吧！`;
  try {
    const result = await subscribeMessageCollection.add({
      data: {
        remindId,
        remindTime,
        touser: OPENID,
        page: `/pages/pet/open-remind/open-remind?remindId=${remindId}`,
        data: {
          name1: {
            value: petName
          },
          phrase2: {
            value: project
          },
          date3: {
            value: moment(planTime).format('YYYY年M月D日 HH:MM')
          },
          thing5: {
            value: note
          }
        },
        templateId,
        done: false, // 消息发送状态
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};
