// pages/moment-edit-box/moment-edit-box
const MAX_WORDS_NUM = 140
const MAX_IMAGE_NUM = 9
let content = ''
let userInfo = ''

Page({
    data: {
      inputWordsNum: 0,
      footerBottom: 0,  // 底部键盘弹出时【发布】的按钮栏高度
      images: [],
      selectedPhoto: true,
    },

    onLoad(event) {

    }
})