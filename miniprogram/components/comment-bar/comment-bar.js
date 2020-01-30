// components/comment-bar/comment-bar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // barShow: Boolean,
    // commentShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    barShow: true,
    commentShow: false,
    footerBottom: 0,
  },

  options: {
    styleIsolation: "apply-shared"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleFocus(event) {
      const { detail: { height } = {} } = event
      this.setData({
        barShow: false,
        commentShow: true,
        footerBottom: height,
      })
    },
    handleBlur() {
      this.setData({
        barShow: true,
        commentShow: false,
        footerBottom: 0,
      })
    },
  }
});
