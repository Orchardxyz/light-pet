import formatTime from "../../../utils/formatTime";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    momentId: "",
    moment: {},
    likeCount: 0,
    commentCount: 0,
    firstComment: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { momentId = "" } = options;
    this._getMomentDetail(momentId);
  },

  // 加载动态详情
  _getMomentDetail(momentId) {
    wx.showLoading({
      title: "拼命加载中",
      mask: true
    });
    wx.cloud
      .callFunction({
        name: "community",
        data: {
          momentId,
          $url: "detail"
        }
      })
      .then(res => {
        const {
          result: {
            detail: { data: moment } = {},
            comment: { data: commentList } = []
          }
        } = res;
        const { likes = [], commentCount } = moment;
        const firstComment = commentList[0]
        firstComment.createTime = formatTime(
          new Date(firstComment.createTime)
        );
        const { children = [] } = firstComment

        this.setData({
          moment,
          momentId,
          commentCount,
          firstComment,
          likeCount: likes.length,
        });

        wx.hideLoading();
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
