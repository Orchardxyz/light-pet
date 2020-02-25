module.exports = async content => {
  const { result } = await wx.cloud.callFunction({
    name: "msgSecCheck",
    data: {
      content
    }
  });
  const { errCode } = result
  return errCode === 0 ? true : false
};
