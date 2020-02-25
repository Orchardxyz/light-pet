import MIMEType from "./MIMEType";

module.exports = async image => {
  const imgType = /\.\w+$/.exec(image)[0];
  const img = wx.getFileSystemManager().readFileSync(image, "base64");
  const contentType = MIMEType(imgType);
  const { result } = await wx.cloud.callFunction({
    name: "imgSecCheck",
    data: {
      contentType,
      img
    }
  });
  const { errCode } = result;
  return errCode === 0 ? true : false;
};
