// 基础配置一下Echarts
// TODO initChart
export function updateColumnChartEChart(chart: any, sortedScore: any) {
  console.log(sortedScore);
  // 对发来的数据做处理并按score大小进行排序
  const data = sortedScore.map((item: any) => {
    return [item.name, item.color, item.score, item.member];
  });
  // 将data按score大小进行排序
  data.sort(function (a: any, b: any) {
    return b[2] - a[2];
  });

  // 将数据中颜色取出
  const color = data.map((item: any) => {
    return item[1];
  });
  console.log(data);
  // 在这里对图表进行配置和渲染
  // 把配置和数据放这里
  const option = {
    dataset: [
      {
        dimensions: ["name", "color", "score", "member"],
        source: data,
      },
      {
        transform: {
          type: "sort",
          config: { dimension: "score", order: "desc" },
        },
      },
    ],
    animationDuration: 0,
    animationDurationUpdate: 1000,
    animationEasing: "linear",
    animationEasingUpdate: "linear",
    xAxis: {
      type: "category",
      axisLabel: { interval: 0, rotate: 30 },
    },
    yAxis: {},
    series: {
      type: "bar",
      encode: { x: "name", y: "score" },
      datasetIndex: 1,
      label: {
        show: true,
        position: "top",
        formatter: function (params: any) {
          return params.data[2];
        },
      },
      itemStyle: {
        barBorderRadius: [5, 5, 0, 0], // 设置圆角
        color: function (params: any) {
          return color[params.dataIndex];
        },
      },
    },
  };
  chart.setOption(option);
  window.onresize = function () {
    //自适应大小
    chart.resize();
  };
}
