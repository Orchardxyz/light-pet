module.exports = (type = "msg") => {
  if (type === "msg") {
    wx.showToast({
      title: "对不起，文字内容含有违法违规内容",
      icon: "warn",
      duration: 1500,
      mask: false
    });
  } else if (type === "img") {
    wx.showToast({
      title: "对不起，图片中含有违法违规内容",
      icon: "warn",
      duration: 1500,
      mask: false
    });
  }
};
