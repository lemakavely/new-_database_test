window.addEventListener('load', onload);

function onload(event){
  chartP = createPowerChart();
  chartW = createWaterChart();
}
function createPowerChart() {
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-power',
      type: 'spline' 
    },
    series: [
      {
        name: 'time'
      }
    ],
    title: { 
      text: undefined
    },
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { 
        text: 'Power consumption in watts' 
      }
    },
    credits: { 
      enabled: false 
    }
  });
  return chart;
}
function createWaterChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-water',
      type: 'spline'  
    },
    series: [{
      name: 'time'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#50b8b4' 
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M:%S' }
    },
    yAxis: {
      title: { 
        text: 'Water consumption in volumes' 
      }
    },
    credits: { 
      enabled: false 
    }
  });
  return chart;
}
