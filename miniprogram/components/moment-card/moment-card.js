import formatTime from '../../utils/formatTime'

Component({
  data: {
    createTime: ''
  },
  properties: {
    moment: Object,
  },
  observers: {
    ['moment.createTime'](time) {
      if (time) {
        this.setData({
          createTime: formatTime(new Date(time))
        })
      }
    }
  },
  methods: {
    preveiwImage(event) {
      const dataset = event.target.dataset
      wx.previewImage({
        current: dataset.imgsrc,
        urls: dataset.imgs,
      });
    }
  }
})