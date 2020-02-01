// components/comment-bar/comment-bar.js
let current_content = "";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholderTxt: String,
    defaultValue: String,
    commentShow: Boolean,
    isReply: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    barShow: true,
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
      const { detail: { height } = {} } = event;
      this.setData({
        barShow: false,
        commentShow: true,
        footerBottom: height
      });
    },
    handleBlur() {
      this.setData({
        barShow: true,
        commentShow: false,
        footerBottom: 0
      });
    },

    // 监听评论弹框输入事件
    handleInput(event) {
      const {
        detail: { value }
      } = event;
      current_content = value;
    },

    // 发送评论
    handleSubmit() {
      const { isReply } = this.properties
      if (isReply) {
        this.triggerEvent("handleReply", current_content);
      }
    }
  }
});
