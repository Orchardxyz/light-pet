Component({
  /**
   * 页面的初始数据
   */
  data: {
  },
  properties: {
    navbarActiveIndex: Number,
    navbarTitle: Array,
  },
  methods: {
    /**
     * 点击导航栏
     */
    handleNavBarTap(event) {
      let navbarTapIndex = event.currentTarget.dataset.navbarIndex
      this.setData({
        navbarActiveIndex: navbarTapIndex      
      })
    },

    /**
     * 
     */
    handleBindAnimationFinish({detail}) {
      this.setData({
        navbarActiveIndex: detail.current
      })
    }
  }
})