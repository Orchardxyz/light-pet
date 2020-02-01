Component({
  data: {},
  properties: {
    comment: Object,
    isChild: Boolean,
  },
  methods: {
    handleComment() {
      const { comment } = this.properties
      this.triggerEvent('onComment', comment)
    }
  }
})