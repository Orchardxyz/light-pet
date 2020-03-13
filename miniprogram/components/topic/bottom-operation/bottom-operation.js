let content = "";

Component({
  data: {
    isOpen: false,
    wordNum: 0,
    MAX_COUNT: 200
  },
  properties: {
    isLike: Boolean
  },
  options: {
    styleIsolation: "apply-shared"
  },
  methods: {
    openCommentDialog() {
      this.setData({
        isOpen: true
      });
    },
    closeCommentDialog() {
      this.setData({
        isOpen: false
      });
    },
    clickLike() {
      // 前端先展示
      const { isLike } = this.data;
      this.setData({
        isLike: !isLike
      });
      this.triggerEvent("onLike");
    },
    handleInput(event) {
      const {
        detail: { value }
      } = event;
      content = value;
      this.setData({
        wordNum: value.length
      });
    },
    submitComment() {
      this.triggerEvent("onComment", content);
      this.setData({
        isOpen: false
      });
    }
  }
});
