// pages/community/community.js
// 每页获取的最大数据
const MAX_COUNT = 10;
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    navbarActiveIndex: 0,
    navbarTitle: ["社区", "关注"],
    momentList: [],
    isPetSelected: false,
    currentIndex: -1,
    petList: [],
    animation: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this._loadCommunityMoments();
  },

  // 初始化动态列表
  _initMomentsList() {
    this.setData({
      momentList: [],
      isPetSelected: false,
      currentIndex: -1
    });
  },

  // 加载社区所有动态
  _loadCommunityMoments(start = 0) {
    if (start === 0) {
      this._initMomentsList();
    }
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
          count: MAX_COUNT,
          $url: "getAllMomentList"
        }
      })
      .then(res => {
        this.setData({
          momentList: this.data.momentList.concat(res.result)
        });
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  // 加载关注的好友动态列表
  _loadCommunityFollowingList(start = 0) {
    if (start === 0) {
      this._initMomentsList();
    }
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    this.setData({
      momentList: this.data.momentList.concat(["follow1", "follow2", "follow3"])
    });
    wx.hideLoading();
  },

  // 判断有无授权登录
  _isAuthored() {
    wx.getSetting({
      success: result => {
        if (result.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            withCredentials: "false",
            lang: "zh_CN",
            timeout: 10000,
            success: result => {
              this.onLoginSuccess({
                detail: result.userInfo
              });
            }
          });
        } else {
          this.setData({
            modalShow: true
          });
        }
      }
    });
  },

  // _animate(status) {
  //   // 第1步：创建动画实例
  //   const animation = wx.createAnimation({
  //     duration: 200, //动画时长
  //     timingFunction: "linear", //线性
  //     delay: 0 //0则不延迟
  //   });

  //   // 第2步：这个动画实例赋给当前的动画实例
  //   this.animation = animation;

  //   // 第3步：执行第一组动画：Y轴偏移240px后(盒子高度是240px)，停
  //   animation.translateY(360).step();

  //   // 第4步：导出动画对象赋给数据对象储存
  //   this.setData({
  //     animation: animation.export()
  //   });

  //   setTimeout(
  //     function() {
  //       // 执行第二组动画：Y轴不偏移，停
  //       animation.translateY(0).step();
  //       // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
  //       this.setData({
  //         animation
  //       });
  //       if (status == "close") {
  //         this.setData({
  //           isPetSelected: false
  //         });
  //       }
  //     }.bind(this),
  //     200
  //   );

  //   // 显示抽屉
  //   if (status == "open") {
  //     this.setData({
  //       isPetSelected: true
  //     });
  //   }
  // },

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
    this._isAuthored();
  },

  // 登录成功
  onLoginSuccess() {
    const {
      globalData: { petList = [] }
    } = app;
    this.setData({
      isPetSelected: true,
      petList
    });
    // this._animate("open");
  },
  // 登录失败
  onLoginFail() {
    wx.showModal({
      title: "只有已登录的用户才能够发布动态",
      content: ""
    });
  },

  handlePublish() {
    const { currentIndex } = this.data;
    if (currentIndex > -1) {
      const {
        globalData: {
          userInfo: { nickName, avatarUrl }
        }
      } = app;
      wx.navigateTo({
        url: `../moment-edit-box/moment-edit-box?nickName=${nickName}&avatarUrl=${avatarUrl}&index=${currentIndex}`
      });
      this._initMomentsList();
    } else {
      return;
    }
  },

  handleCancel() {
    this.setData({
      isPetSelected: false,
      currentIndex: -1
    });
    // this._animate("close");
  },

  /**
   * 点击导航栏
   */
  handleNavBarTap(event) {
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex;
    this.setData({
      navbarActiveIndex: navbarTapIndex
    });
    navbarTapIndex === 0
      ? this._loadCommunityMoments()
      : this._loadCommunityFollowingList();
  },

  // 进入动态详情页
  enterMomentDetail(event) {
    const {
      target: {
        dataset: { momentid }
      }
    } = event;
    wx.navigateTo({
      url: `../moment/moment-detail/moment-detail?momentId=${momentid}`
    });
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
    this._initMomentsList();
    this.data.navbarActiveIndex === 0
      ? this._loadCommunityMoments()
      : this._loadCommunityFollowingList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const start = this.data.momentList.length;
    this.data.navbarActiveIndex === 0
      ? this._loadCommunityMoments(start)
      : this._loadCommunityFollowingList(start);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
