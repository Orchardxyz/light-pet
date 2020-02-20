module.exports = () => {
  const app = getApp();
  const {
    globalData: { isLogin }
  } = app;
  return isLogin;
};
