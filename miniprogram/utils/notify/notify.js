module.exports = (reciever_id, type, action, source_id, content, img = "") => {
  const app = getApp();
  const {
    globalData: { userInfo }
  } = app;
  wx.cloud.callFunction({
    name: "notification",
    data: {
      $url: "send",
      reciever_id,
      sender: userInfo,
      type,
      action,
      source_id,
      content,
      img
    }
  });
};
