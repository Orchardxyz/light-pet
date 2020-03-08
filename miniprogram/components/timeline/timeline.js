Component({
  data: {
    yearShow: true,
    newsList: [
      {
        content:
          "【新加坡风投公司Golden Gate Ventures发起规模1000万美元的加密基金】 位于新加坡的风险投资公司Golden Gate Ventures周五宣布，将发起名为LuneX Ventures、规模1000万美元的基金，投资加密货币和区块链技术初创企业。（路透）",
        time: 1533905187022
      },
      
    ]
  },
  properties: {
    year: String,
    month: String,
    timeline: Array,
    petShow: Boolean
  },
  options: {
    styleIsolation: "apply-shared"
  },
  observers: {
    year(y) {
      const currentYear = new Date(Date.now()).getFullYear()
      if (Number(y) === currentYear) {
        this.setData({
          yearShow: false
        })
      }
    }
  },
  methods: {}
});
