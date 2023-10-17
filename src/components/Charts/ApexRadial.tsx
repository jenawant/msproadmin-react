import ReactApexChart from 'react-apexcharts';

const ApexRadial = ({
  dataColors,
  label,
  percent = 0,
  height = 200,
}: {
  dataColors?: string[];
  label: string;
  percent: number;
  height?: number;
}) => {
  const series = [percent];
  const options = {
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: '13px',
            color: void 0,
            offsetY: 60,
          },
          value: {
            offsetY: 22,
            fontSize: '16px',
            color: void 0,
            formatter: function (e: number) {
              return e + '%';
            },
          },
        },
      },
    },
    colors: dataColors,
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.15,
        inverseColors: !1,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91],
      },
    },
    stroke: {
      dashArray: 4,
    },
    labels: [label],
    xaxis: {
      labels: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#78909C',
        height: 1,
        width: '100%',
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        borderType: 'solid',
        color: '#78909C',
        height: 6,
        offsetX: 0,
        offsetY: 0,
      },
    },
  };
  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height={height}
      className="apex-charts"
    />
  );
};

export default ApexRadial;
