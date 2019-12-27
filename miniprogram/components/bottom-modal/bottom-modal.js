Component({
  data: {},
  properties: {
    modalShow: Boolean,
  },
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true,  // 多插槽
  },
  methods: {
    onClose() {
      this.setData({
        modalShow: false,
      })
    }
  }
})