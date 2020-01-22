require('./site/index.html')
require('./site/style.css')

global.DEBUG = false

const url = "ws://127.0.0.1:8011/stomp"

const client = Stomp.client(url)

client.heartbeat.outgoing = 30000;
client.heartbeat.incoming = 30000;

// client.debug = function(msg) {
//   if (global.DEBUG) {
//     console.info(msg)
//   }
// }


client.connect({}, () => {

        client.send("/fx/prices", {});

        let tableObject = {};

        client.subscribe("/fx/prices", function(message) {
            var priceObject = JSON.parse(message.body);
            tableObject[priceObject.name] = priceObject;
            renderTable(tableObject);
        });

    },
    (error) => {

        console.log(error)

    });

function renderTable(tableObject) {

  let graphID = document.getElementById("sorted-data");

  graphID.innerHTML = "";

  var positions = [];
  positions.push(0)
  var sortable = [];

  for (const key in tableObject) {
      if (tableObject.hasOwnProperty(key)) {
          const separatePriceObject = tableObject[key];
          sortable.push(separatePriceObject);
      }
  }

  sortable.sort(function(a, b) {
      return b.lastChangeBid - a.lastChangeBid;
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
    // var sparkline = new Sparkline(row.querySelector("span.sparkline"), {startColor:"red", minColor:"blue", maxColor:"green", width:200, lineColor:"#666"});
    var sparkline = new Sparkline(row.querySelector("span.sparkline"));

    sparkline.draw(positions);

    graphID.appendChild(row);

    positions.push((Math.round(bestBid) + Math.round(bestAsk)) / 2);

    sparkline.draw(positions);
    
  }

  let lastBestBidId = document.getElementById("lastChangeBid");

  lastBestBidId.innerHTML = Math.round(sortable[0].lastChangeBid * 100) / 100;

  Sparkline.draw(document.getElementById("lastChangeBid-sparkline"), [0,(Math.round(sortable[0].bestBid) + Math.round(sortable[0].bestAsk)) / 2]);

}