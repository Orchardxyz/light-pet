Component({
  data: {
    yearShow: true,
    left: 21,
    newsList: [
      {
        content:
          "【新加坡风投公司Golden Gate Ventures发起规模1000万美元的加密基金】 位于新加坡的风险投资公司Golden Gate Ventures周五宣布，将发起名为LuneX Ventures、规模1000万美元的基金，投资加密货币和区块链技术初创企业。（路透）",
        time: 1533905187022
      }
    ]
  },
  properties: {
    year: String,
    month: String,
    timeline: Array,
    petShow: Boolean,
    phone: String
  },
  options: {
    styleIsolation: "apply-shared"
  },
  observers: {
    year(y) {
      const currentYear = new Date(Date.now()).getFullYear();
      if (Number(y) === currentYear) {
        this.setData({
          yearShow: false
        });
      }
    },
    phone(p) {
      let left = 21;
      switch (p) {
        case "iPhone 5":
          left = 25;
          break;
        case "iPhone 6 Plus":
        case "iPhone 7 Plus":
        case "iPhone 8 Plus":
        case "iPhone 6/7/8 Plus":
        case "iPhone XR":
          left = 19;
          break;
        case "iPhone XS Max":
          left = 18.5
          break
      }
      this.setData({
        left
      });
    }
  },
  methods: {}
});
