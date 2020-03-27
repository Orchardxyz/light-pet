import increaseView from "../../utils/moment/increaseView";
import rankType from "../../utils/moment/rankType";

// 每页获取的最大数据
const MAX_COUNT = 4;
// 每页获取的最大话题数
const MAX_TOPIC = 10;
// 筛选类型
const topicRankType = [
  {
    type: rankType.COMPREHENSIVE,
    text: "综合排序"
  },
  {
    type: rankType.NEWEST,
    text: "最新话题"
  },
  {
    type: rankType.MOST_COMMENT,
    text: "评价最多"
  },
  {
    type: rankType.MOST_VIEW,
    text: "浏览量最高"
  }
];

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    init: true,
    loginShow: false,
    navbarActiveIndex: 0,
    navbarTitle: ["热门动态", "实时动态", "话题中心"],
    momentList: [[]],
    topicList: [],
    topicSortType: "综合排序", // 排序方式
    // isPetSelected: false,
    isPetDialogOpen: false,
    animation: {},
    currentIndex: -1,
    petList: [],
    animation: {},
    publishBtnShow: true,
    isAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { index = 0 } = options
    this._refreshData(parseInt(index));
  },

  // 初始化动态列表
  _initData() {
    this.setData({
      momentList: [],
      topicList: [],
      isPetSelected: false,
      currentIndex: -1,
      isAll: false
    });
  },

  // 刷新数据
  _refreshData(navbarActiveIndex = 0) {
    this._initData();
    this.setData({
      navbarActiveIndex
    });
    switch (navbarActiveIndex) {
      case 0:
        this._loadCommunityMoments();
        break;
      case 1:
        this._loadCommunityMoments(0, rankType.NEWEST);
        break;
      case 2:
        this.setData({
          publishBtnShow: false
        });
        const { topicSortType } = this.data;
        const result = topicRankType.find(({ text }) => text === topicSortType);
        this._loadTopicList(0, result.type);
        break;
      default:
        break;
    }
  },

  // 加载社区动态
  _loadCommunityMoments(start = 0, type = rankType.COMPREHENSIVE) {
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    // 请求数据
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          start,
          type,
          count: MAX_COUNT,
          $url: "getAllMomentList"
        }
      })
      .then(res => {
        const { momentList } = this.data;
        const { result } = res;
        if (result.length > 0) {
          this.setData({
            init: false,
            [`momentList[${momentList.length}]`]: result
          });
        } else {
          this.setData({
            init: false,
            isAll: true
          });
        }
        this.setData({
          publishBtnShow: true
        });
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  // 加载宠物话题数据
  _loadTopicList(start = 0, type = rankType.COMPREHENSIVE) {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "topic",
        data: {
          $url: "getAll",
          start,
          count: MAX_TOPIC,
          type
        }
      })
      .then(res => {
        const { result } = res;
        const { topicList } = this.data;
        if (result.length > 0) {
          this.setData({
            init: false,
            [`topicList[${topicList.length}]`]: result
          });
        } else {
          this.setData({
            init: false,
            isAll: true
          });
        }
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  _setLoginShow() {
    this.setData({
      loginShow: true
    });
  },

  // 选择宠物
  handleClick(event) {
    const {
      currentTarget: {
        dataset: { index }
      }
    } = event;
    this.setData({
      currentIndex: index
    });
  },

  // 发布动态
  onPublish() {
    if (app.isLogin()) {
      const petList = wx.getStorageSync("petList");
      if (petList.length === 0) {
        wx.showModal({
          title: "",
          content: "您好像还没有添加宠物哦，请先添加宠物",
          showCancel: true,
          cancelText: "取消",
          cancelColor: "#000000",
          confirmText: "马上去",
          confirmColor: "#3CC51F",
          success: result => {
            if (result.confirm) {
              wx.switchTab({
                url: "/pages/pet/pet"
              });
            }
          }
        });
      } else {
        this.setData({
          isPetDialogOpen: true,
          petList
        });
      }
    } else {
      this._setLoginShow();
    }
  },

  handlePublish() {
    const { currentIndex } = this.data;
    if (currentIndex > -1) {
      const { nickName, avatarUrl } = app.getUserInfo();
      wx.navigateTo({
        url: `../moment/moment-edit-box/moment-edit-box?nickName=${nickName}&avatarUrl=${avatarUrl}&index=${currentIndex}`
      });
      this.closeDialog();
    } else {
      return;
    }
  },

  closeDialog() {
    this.setData({
      isPetDialogOpen: false,
      currentIndex: -1
    });
  },

  /**
   * 点击导航栏
   */
  handleNavBarTap(event) {
    if (app.isLogin()) {
      const {
        currentTarget: {
          dataset: { navbarIndex }
        }
      } = event;
      this._refreshData(navbarIndex);
    } else {
      this._setLoginShow();
    }
  },

  // 删除动态
  handleDeleteMoment(event) {
    const { detail: momentId } = event;
    wx.showLoading({
      title: "删除中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          $url: "deleteMoment",
          momentId
        }
      })
      .then(() => {
        const {
          currentTarget: {
            dataset: { index }
          }
        } = event;
        const { momentList } = this.data;
        momentList.map(moment => {
          const { _id } = moment[index];
          if (_id === momentId) {
            moment.splice(index, 1);
          }
        });
        this.setData({
          momentList
        });
        wx.hideLoading();
      });
  },

  // 进入动态详情页
  enterMomentDetail(event) {
    if (app.isLogin()) {
      const {
        target: {
          dataset: { momentid, islike }
        }
      } = event;
      wx.navigateTo({
        url: `../moment/moment-detail/moment-detail?momentId=${momentid}&isLike=${islike}`
      });
      increaseView(momentid);
    } else {
      this.setData({
        loginShow: true
      });
    }
  },

  // 进入话题详情页
  entailTopicDetail(event) {
    const {
      currentTarget: {
        dataset: { topicid: topicId }
      }
    } = event;
    // 增加浏览量
    wx.cloud
      .callFunction({
        name: "topic",
        data: {
          $url: "/view/increase",
          topicId
        }
      })
      .then(() => {
        wx.navigateTo({
          url: `../topic/topic-detail/topic-detail?topicId=${topicId}`
        });
      });
  },

  // 打开筛选菜单
  openScreenMenu() {
    const { navbarActiveIndex } = this.data;
    const itemList = [];
    if (navbarActiveIndex === 2) {
      topicRankType.forEach(({ text }) => itemList.push(text));
      wx.showActionSheet({
        itemList,
        itemColor: "#000000",
        success: result => {
          if (result.errMsg === "showActionSheet:ok") {
            const { tapIndex } = result;
            this.setData({
              topicSortType: itemList[tapIndex]
            });
            this._refreshData(navbarActiveIndex);
          }
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    const { navbarActiveIndex } = this.data;
    this._refreshData(navbarActiveIndex);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const { navbarActiveIndex, momentList, topicList, isAll } = this.data;
    if (!isAll) {
      switch (navbarActiveIndex) {
        case 0:
          this._loadCommunityMoments(momentList.length * MAX_COUNT);
          break;
        case 1:
          this._loadCommunityMoments(
            momentList.length * MAX_COUNT,
            rankType.NEWEST
          );
          break;
        case 2:
          const { topicSortType } = this.data;
          const result = topicRankType.find(
            ({ text }) => text === topicSortType
          );
          this._loadTopicList(topicList.length * MAX_TOPIC, result.type);
          break;
        default:
          break;
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
