module.exports = () => {
  const isLogin = wx.getStorageSync('isLogin');
  return isLogin;
};
