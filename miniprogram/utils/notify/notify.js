module.exports = (
  reciever_id,
  reciever_name = "",
  type,
  action,
  source_params = {},
  content,
  img = "",
  notify_content = ""
) => {
  const app = getApp();
  const userInfo = app.getUserInfo();
  wx.cloud.callFunction({
    name: "notification",
    data: {
      $url: "send",
      reciever_id,
      reciever_name,
      sender: userInfo,
      type,
      action,
      source_params,
      notify_content,
      content,
      img
    }
  });
};
