require('./site/index.html')
require('./site/style.css')

global.DEBUG = false

const url = "ws://127.0.0.1:8011/stomp"

const client = Stomp.client(url)

client.heartbeat.outgoing = 30000;
client.heartbeat.incoming = 0;
    
    client.reconnect_delay = 50000;

client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}


client.connect({}, () => {

        client.send("/fx/prices", {'priority': '9'}, 'Hello world');

        let tableObject = {};

        client.subscribe("/fx/prices", function(message) {
            var priceObject = JSON.parse(message.body);
            tableObject[priceObject.name] = priceObject;
            
        });

        setInterval(()=>{
          renderTable(tableObject);
        },3000);

    },
    (error) => {

        console.log(error)

    });
    var positions = [];
function renderTable(tableObject) {

  let graphID = document.getElementById("sorted-data");

  graphID.innerHTML = "";

  
  var sortable = [];

  for (const key in tableObject) {
      if (tableObject.hasOwnProperty(key)) {
          const separatePriceObject = tableObject[key];
          sortable.push(separatePriceObject);
      }
  }

  sortable.sort(function(a, b) {
      return a.lastChangeBid - b.lastChangeBid;
  });

  for (let index = 0; index < sortable.length; index++) {

    let priceObject = sortable[index];
    let name = priceObject.name;
    let bestBid = priceObject.bestBid;
    let bestAsk = priceObject.bestAsk;
    let lastChangeBid = priceObject.lastChangeBid;
    let lastChangeAsk = priceObject.lastChangeAsk;

    

    var row = document.createElement("tr");

    var td = '<td>' + (index + 1) + '</td>';
    td += '<td>' + name + '</td>';
    td += '<td>' + bestBid + '</td>';
    td += '<td>' + bestAsk + '</td>';
    td += '<td>' + lastChangeBid + '</td>';
    td += '<td>' + lastChangeAsk + '</td>';
    td += '<td><span class="sparkline"></span></td>';


    row.innerHTML = td;
    var sparkline = new Sparkline(row.querySelector("span.sparkline"), {startColor:"red", minColor:"blue", maxColor:"green", width:150, lineColor:"#666"});
    // var sparkline = new Sparkline(row.querySelector("span.sparkline"));

    if(positions.length>4){
     positions.shift();
    }

    // sparkline.draw(positions);

    graphID.appendChild(row);
    

    positions.push((Math.round(bestBid) + Math.round(bestAsk)) / 2);

    // console.log(positions);

    sparkline.draw(positions);

    if(index==0){
      var elm = document.getElementById("lastChangeBid-sparkline");

      let sparkline = new Sparkline(elm, {
        lineColor: "#666",
        startColor: "orange",
        endColor: "blue",
        maxColor: "red",
        minColor: "green",
        dotRadius: 3,
        width: 150
      });
      sparkline.draw(positions);
    }
    
    
  }

  let lastBestBidId = document.getElementById("lastChangeBid");

  lastBestBidId.innerHTML = Math.round(sortable[0].lastChangeBid * 100) / 100;

  

}