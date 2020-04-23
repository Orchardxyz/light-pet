import { SUBSCRIBE_REMIND_TEMPID } from "../../../utils/defaultValue";

const OPEN_TXT = "开启健康提醒";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    init: true, // 是否还在加载状态
    hasSet: false,
    petId: "",
    petName: "",
    projectId: "",
    species: "",
    // 从后台返回前台页面要显示的内容
    project: "",
    introduction: "",
    advice: "",
    icon: "",
    color: "",
    lastTime: "",
    // 设置提醒时间
    planTime: "",
    planClock: undefined,
    advanceDay: [
      "当天提醒",
      "提前一天",
      "提前两天",
      "提前三天",
      "提前四天",
      "提前五天",
    ],
    index: 0,
    remindDay: 0,
    tomorrow: "",
    // 按钮
    btnSet: false,
    btnShow: false,
    btnDisabled: false,
    openBtnTxt: OPEN_TXT,
    openBtnLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { petId, petName, projectId, species } = options;
    wx.setNavigationBarTitle({
      title: `${species}提醒事项`,
    });
    this.setData({
      petId,
      petName,
      projectId,
      species,
    });
    this._loadProject(petId, projectId);
  },

  _loadProject(petId, projectId) {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "project",
          petId,
          projectId,
        },
      })
      .then((res) => {
        const { result } = res;
        const {
          project,
          introduction,
          advice,
          icon,
          color,
          lastTime = "",
        } = result;
        const tomorrow = this._getTomorrow();
        this.setData({
          project,
          icon,
          color,
          init: false,
          // 小程序的问题, 要在后台数据库将换行符\n替换成其他字符（如&&&&）
          // 再利用前端替换才能显示换行，不然会直接将\n显示在页面
          introduction: introduction.split("&&&").join("\n"),
          advice: advice.split("&&&").join("\n"),
          lastTime,
          planTime: tomorrow,
        });
        wx.hideLoading();
      });
  },

  // 获取明日日期
  _getTomorrow() {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${year}-${month}-${day}`;
  },

  planDateChange(event) {
    const {
      detail: { value },
    } = event;
    this.setData({
      planTime: value,
    });
  },

  clockChange(event) {
    const {
      detail: { value },
    } = event;
    this.setData({
      planClock: value,
    });
  },

  remindTimeChange(event) {
    const {
      detail: { value },
    } = event;
    this.setData({
      index: value,
      remindDay: value,
    });
  },

  // 订阅消息
  subscribeRemind() {
    wx.requestSubscribeMessage({
      // 最多允许三条订阅消息
      tmplIds: [SUBSCRIBE_REMIND_TEMPID],
      success: (res) => {
        if (res[SUBSCRIBE_REMIND_TEMPID] === "accept") {
          this.handleOpenRemind();
        } else if (res[SUBSCRIBE_REMIND_TEMPID] === "reject") {
          wx.showToast({
            title: "请先允许订阅消息才能开启提醒功能",
            icon: "none",
          });
        }
      },
    });
  },

  // 开启提醒
  handleOpenRemind() {
    const {
      petId,
      petName,
      species,
      projectId,
      project,
      remindDay,
      planTime,
      planClock,
    } = this.data;
    if (
      Date.now() >
      new Date(planTime).getTime() - remindDay * 24 * 60 * 60 * 1000
    ) {
      wx.showModal({
        title: "请检查",
        content: "提醒时间与项目时间冲突！",
      });
      return;
    }
    this.setData({
      openBtnLoading: true,
      btnDisabled: true,
      btnSet: true,
      openBtnTxt: "开启中",
    });
    wx.cloud.callFunction({
      name: "petHealth",
      data: {
        $url: "/remind/add",
        petId,
        petName,
        species,
        projectId,
        project,
        planTime,
        planClock,
        remindDay,
      },
      success: (res) => {
        const {
          result: { _id },
        } = res;
        wx.cloud
          .callFunction({
            name: "subscribe",
            data: {
              remindId: _id,
              templateId: SUBSCRIBE_REMIND_TEMPID,
            },
          })
          .then((res) => {
            this.setData({
              hasSet: true,
              openBtnTxt: "已开启",
              btnShow: true,
              openBtnLoading: false,
            });
          });
      },
    });
  },

  // 返回上一页并刷新
  handleReturn() {
    // 返回上一页并刷新
    wx.navigateBack();
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.onPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
