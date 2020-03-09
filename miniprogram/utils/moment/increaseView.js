module.exports = momentId => {
  wx.cloud.callFunction({
    name: "community",
    data: {
      $url: "/view/increase",
      momentId
    }
  });
};
