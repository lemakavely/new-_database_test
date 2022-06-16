function epochToJsDate(epochTime){
  return new Date(epochTime*1000);
}
function epochToDateTime(epochTime){
  var epochDate = new Date(epochToJsDate(epochTime));
  var dateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + " " +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);

  return dateTime;
}
function plotValues(chart, timestamp, value){
  var x = epochToJsDate(timestamp).getTime();
  var y = Number (value);
  if(chart.series[0].data.length > 40) {
    chart.series[0].addPoint([x, y], true, true, true);
  } else {
    chart.series[0].addPoint([x, y], true, false, true);
  }
}
const navElement = document.querySelector('#mainavbar');
const theblurthing = document.querySelector("#theblurthing");
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');
const cardsReadingsElement = document.querySelector("#cards-div");
const gaugesReadingsElement = document.querySelector("#gauges-div");
const chartsDivElement = document.querySelector('#charts-div');
const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const co2Element = document.getElementById("co2");
const updateElement = document.getElementById("lastUpdate")

document.getElementById("toggle").addEventListener("change",function() {
	this.setAttribute("aria-checked",this.checked);
});
const setupUI = (user) => {
  if (user) {
    loginElement.style.display = 'none';
    chartsDivElement.style.display = 'block';
    theblurthing.style.display = 'none';
    contentElement.style.display = 'block';
    navElement.style.display = 'block';
       var uid = user.uid;
    console.log(uid);
    var dbPath = 'UsersData/' + uid.toString() + '/readings';
    var chartPath = 'UsersData/' + uid.toString() + '/charts/range';
    var dbRef = firebase.database().ref(dbPath);
    var chartRef = firebase.database().ref(chartPath);

    var chartRange = 0;
    chartRef.on('value', snapshot =>{
      chartRange = Number(snapshot.val());
      console.log(chartRange);
      chartP.destroy();
      chartW.destroy();
      chartP = createPowerChart();
      chartW = createWaterChart();
      dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); 
        var powerCons = jsonData.power;
        var waterCons = jsonData.waterVolume;
        var timestamp = jsonData.timestamp;
        plotValues(chartP, timestamp, powerCons);
        plotValues(chartW, timestamp, waterCons);
      });
    });
    chartsRangeInputElement.onchange = () =>{
      chartRef.set(chartsRangeInputElement.value);
    };
    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
      var jsonData = snapshot.toJSON(); 
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var co2 = jsonData.co2;
      var timestamp = jsonData.timestamp;
      tempElement.innerHTML = temperature;
      humElement.innerHTML = humidity;
      co2Element.innerHTML = co2;
      updateElement.innerHTML = epochToDateTime(timestamp);
    });

    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
      var jsonData = snapshot.toJSON();
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var timestamp = jsonData.timestamp;
      var gaugeT = createTemperatureGauge();
      var gaugeH = createHumidityGauge();
      gaugeT.draw();
      gaugeH.draw();
      gaugeT.value = temperature;
      gaugeH.value = humidity;
      updateElement.innerHTML = epochToDateTime(timestamp);
    });

    var lastReadingTimestamp;
    function createTable(){
      var firstRun = true;
      dbRef.orderByKey().limitToLast(100).on('child_added', function(snapshot) {
        if (snapshot.exists()) {
          var jsonData = snapshot.toJSON();
          console.log(jsonData);
          var powerCons = jsonData.power;
          var waterVols = jsonData.waterVolume;
          var timestamp = jsonData.timestamp;
          var content = '';
          content += '<tr>';
          content += '<td>' + epochToDateTime(timestamp) + '</td>';
          content += '<td>' + powerCons + '</td>';
          content += '<td>' + waterVols + '</td>';
          content += '</tr>';
          $('#tbody').prepend(content);
          if (firstRun){
            lastReadingTimestamp = timestamp;
            firstRun=false;
            console.log(lastReadingTimestamp);
          }
        }
      });
    };

    function appendToTable(){
      var dataList = []; 
      var reversedList = [];
      console.log("APEND");
      dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function(snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(element => {
            var jsonData = element.toJSON();
            dataList.push(jsonData);
          });
          lastReadingTimestamp = dataList[0].timestamp; 
          reversedList = dataList.reverse();

          var firstTime = true;
          reversedList.forEach(element =>{
            if (firstTime){ 
              firstTime = false;
            }
            else{
              var powerc = element.power;
              var watervol = element.waterVolume;
              var timestamp = element.timestamp;
              var content = '';
              content += '<tr>';
              content += '<td>' + epochToDateTime(timestamp) + '</td>';
              content += '<td>' + powerc + '</td>';
              content += '<td>' + watervol + '</td>';
              content += '</tr>';
              $('#tbody').append(content);
            }
          });
        }
      });
    }
    viewDataButtonElement.addEventListener('click', (e) =>{
      tableContainerElement.style.display = 'block';
      viewDataButtonElement.style.display ='none';
      hideDataButtonElement.style.display ='inline-block';
      loadDataButtonElement.style.display = 'inline-block'
      createTable();
    });

    loadDataButtonElement.addEventListener('click', (e) => {
      appendToTable();
    });

    hideDataButtonElement.addEventListener('click', (e) => {
      tableContainerElement.style.display = 'none';
      viewDataButtonElement.style.display = 'inline-block';
      hideDataButtonElement.style.display = 'none';
    });

  } else{
    navElement.style.display = 'none';
    loginElement.style.display = 'block';
    chartsDivElement.style.display = 'none';
    theblurthing.style.display = 'block';
    contentElement.style.display = 'none';
  }
}