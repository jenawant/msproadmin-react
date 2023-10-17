/* eslint-disable react-hooks/exhaustive-deps */
import type { GaugeSeriesOption } from 'echarts/charts';
import { GaugeChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import type { CSSProperties, MutableRefObject } from 'react';
import React, { useEffect, useRef } from 'react';

echarts.use([GaugeChart, SVGRenderer]);

type EChartsOption = echarts.ComposeOption<GaugeSeriesOption>;

type DataItem = {
  name: string;
  value: number;
};

export default (props: {
  datas: DataItem[];
  range: [number, number];
  unit: string;
  style?: CSSProperties;
}) => {
  const chartDom: MutableRefObject<any> = useRef(null);

  useEffect(() => {
    const myChart = echarts.getInstanceByDom(chartDom.current) ?? echarts.init(chartDom.current);

    const option: EChartsOption = {
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          startAngle: 200,
          endAngle: -20,
          min: props.range[0],
          max: props.range[1],
          splitNumber: 10,
          itemStyle: {
            color: '#FFAB91',
          },
          progress: {
            show: true,
            width: 30,
          },

          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 30,
            },
          },
          axisTick: {
            distance: -45,
            splitNumber: 5,
            lineStyle: {
              width: 1,
              color: '#aaa',
            },
          },
          splitLine: {
            distance: -47,
            length: 8,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          axisLabel: {
            distance: -13,
            color: '#999',
            fontSize: 12,
          },
          anchor: {
            show: false,
          },
          title: {
            show: true,
            fontSize: 14,
            color: '#00b96b',
            offsetCenter: [0, '50%'],
          },
          detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 30,
            borderRadius: 8,
            offsetCenter: [0, '30%'],
            fontSize: 14,
            fontWeight: 'bolder',
            formatter: `{value} ${props.unit}`,
            color: '#777777',
          },
          data: props.datas,
        },

        {
          type: 'gauge',
          center: ['50%', '60%'],
          startAngle: 200,
          endAngle: -20,
          min: props.range[0],
          max: props.range[1],
          itemStyle: {
            color: '#FD7347',
          },
          progress: {
            show: true,
            width: 8,
          },

          pointer: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          title: {
            show: false,
          },
          detail: {
            show: false,
          },
          data: props.datas,
        },
      ],
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }
    return () => {};
  }, [props.datas]);

  return <div ref={chartDom} style={{ height: 260, ...props.style }} className="echarts-charts" />;
};
