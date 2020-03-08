module.exports = timeline => {
  const result = [];
  const reg = /\d{1,2}/;

  // 处理月份
  timeline &&
    timeline.forEach(obj => {
      let tempIdx = -1;
      const { year } = obj;
      const month = obj.date.match(reg)[0];
      const isSameMonth = result.some((item, index) => {
        if (item.month.match(reg)[0] === month) {
          tempIdx = index;
          return true;
        }
      });
      if (isSameMonth) {
        result[tempIdx].children.push(obj);
      } else {
        result.push({
          year,
          month: `${month}月`,
          children: [obj]
        });
      }
    });

  // 处理日期
  result.forEach(obj => {
    let tempArr = [];
    obj.children.forEach(({ date, time, content, pet, params }) => {
      let tempIdx = -1;
      const isSameDate = tempArr.some((item, index) => {
        if (item.date === date) {
          tempIdx = index;
          return true;
        }
      });
      if (isSameDate) {
        tempArr[tempIdx].data.push({
          ...pet,
          ...params,
          time,
          content
        });
      } else {
        tempArr.push({
          date,
          data: [
            {
              ...pet,
              ...params,
              time,
              content
            }
          ]
        });
      }
    });
    obj.children = tempArr;
  });

  return result;
};
