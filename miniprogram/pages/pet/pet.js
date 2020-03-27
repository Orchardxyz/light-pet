// pages/record/record.js
import formatSpecies from "../../utils/formatSpecies";

const app = getApp();

// 无须与页面绑定的数据
let currentPetId = "";
let currentIndex = -1;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginShow: false,
    loginStatus: true,
    pets: [],
    init: true,
    drawerShow: false,
    currentPetName: "",
    currentSpecies: "",
    animation: {},
    btnIsLoading: [],
    currentHealthProjects: [],
    isMenuOpen: false,
    selectedPetId: "" // 操作时被选的宠物id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadPetList();
  },

  // 加载宠物列表
  _loadPetList() {
    if (app.isLogin()) {
      wx.showLoading({
        title: "加载中",
        mask: true
      });
      wx.cloud
        .callFunction({
          name: "pet",
          data: {
            $url: "/list/detail"
          }
        })
        .then(res => {
          const { result: petList = [] } = res;
          this.setData({
            loginStatus: true,
            loginShow: false,
            pets: petList,
            init: false
          });
          wx.setStorageSync("petList", petList);
          petList.map(() => {
            const { btnIsLoading = [] } = this.data;
            this.setData({
              btnIsLoading: btnIsLoading.concat([false])
            });
          });
          wx.hideLoading();
          wx.stopPullDownRefresh();
        });
    } else {
      this.handleLogin();
    }
  },

  handleLogin() {
    this.setData({
      loginShow: true,
      loginStatus: false
    });
  },

  // // 抽屉动画
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
  //   animation.translateY(240).step();

  //   // 第4步：导出动画对象赋给数据对象储存
  //   this.setData({
  //     animation: animation.export()
  //   });

  //   // 第5步：设置定时器到指定时候后，执行第二组动画
  //   setTimeout(
  //     function() {
  //       // 执行第二组动画：Y轴不偏移，停
  //       animation.translateY(0).step();
  //       // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
  //       this.setData({
  //         animation
  //       });

  //       //关闭抽屉
  //       if (status == "close") {
  //         this.setData({
  //           drawerShow: false
  //         });
  //       }
  //     }.bind(this),
  //     200
  //   );

  //   // 显示抽屉
  //   if (status == "open") {
  //     const { btnIsLoading } = this.data;
  //     btnIsLoading[currentIndex] = false;
  //     this.setData({
  //       drawerShow: true,
  //       btnIsLoading
  //     });
  //   }
  // },

  openDrawer(event) {
    const {
      currentTarget: {
        dataset: { pet, index }
      }
    } = event;
    const { _id: petId, petName, species } = pet;
    const { btnIsLoading } = this.data;
    btnIsLoading[index] = true;
    currentPetId = petId;
    currentIndex = index;
    this.setData({
      currentPetName: petName,
      currentSpecies: formatSpecies(species),
      btnIsLoading
    });
    wx.cloud
      .callFunction({
        name: "petHealth",
        data: {
          $url: "projectList",
          petId,
          species
        }
      })
      .then(res => {
        const { result } = res;
        this.setData(
          {
            currentHealthProjects: result
          },
          () => {
            btnIsLoading[currentIndex] = false;
            this.setData({
              drawerShow: true,
              btnIsLoading
            });
            this.setData({
              drawerShow: true
            });
          }
        );
      });
  },

  closeDrawer() {
    this.setData({
      drawerShow: false
    });
  },

  // 打开操作菜单
  openMenu(event) {
    const {
      currentTarget: {
        dataset: { petid }
      }
    } = event;
    this.setData({
      isMenuOpen: true,
      currentPetId: petid
    });
  },

  // 关闭菜单
  closeMenu() {
    this.setData({
      isMenuOpen: false
    });
  },

  writeDiary() {
    const { nickName, avatarUrl } = app.getUserInfo();
    const { currentPetId } = this.data;
    const petList = wx.getStorageSync("petList");
    let currentIndex;
    petList.map(({ _id }, index) => {
      if (_id === currentPetId) {
        currentIndex = index;
        return;
      }
    });
    wx.navigateTo({
      url: `../moment/moment-edit-box/moment-edit-box?nickName=${nickName}&avatarUrl=${avatarUrl}&index=${currentIndex}`
    });
  },

  // 进入宠物添加页
  enterPetAdd() {
    wx.navigateTo({
      url: "./pet-add/pet-add"
    });
  },

  // 进入宠物健康管理页
  enterDetailPage(event) {
    const {
      currentTarget: {
        dataset: { project }
      }
    } = event;
    const { _id, hasSet, remindId = "" } = project;
    const { currentPetName, currentSpecies } = this.data;
    if (hasSet) {
      wx.navigateTo({
        url: `./open-remind/open-remind?remindId=${remindId}&projectId=${_id}`
      });
    } else {
      wx.navigateTo({
        url: `./pet-health/pet-health?petId=${currentPetId}&petName=${currentPetName}&projectId=${_id}&species=${currentSpecies}`
      });
    }
  },

  // 进入历史记录页
  // enterHealthHistory() {
  //   wx.navigateTo
  // },

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
    this.closeDrawer();
    this._loadPetList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
