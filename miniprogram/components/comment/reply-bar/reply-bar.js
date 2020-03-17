let content = "";
Component({
  data: {
    MAX_COUNT: 200,
    wordNum: 0,
    defaultValue: ""
  },
  properties: {
    isOpen: Boolean,
    placeholderText: String
  },
  options: {
    styleIsolation: "apply-shared"
  },
  methods: {
    openReplyDialog() {
      this.setData({
        isOpen: true
      });
    },
    closeReplyDialog() {
      this.setData({
        isOpen: false,
        defaultValue: "",
        wordNum: 0
      });
      content = ''
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
    submitReply() {
      this.triggerEvent("onReply", content);
      this.closeReplyDialog()
    }
  }
});
