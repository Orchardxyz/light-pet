// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { contentType, img } = event;
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType,
        value: Buffer.from(img)
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};
