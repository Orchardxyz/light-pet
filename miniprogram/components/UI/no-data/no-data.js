Component({
  data: {},
  properties: {
    size: {
      type: Number,
      value: 280
    },
    loginStatus: {
      type: Boolean,
      value: true
    }
  },
  options: {
    styleIsolation: "apply-shared"
  },
  methods: {
    openLogin() {
      this.triggerEvent("onLogin");
    }
  }
});
