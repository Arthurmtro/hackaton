var fs = require('fs');
const converter = require('json-2-csv');

const DATA = require('./data.json');
const DEMANDE = require('./json/input_5.json');

let selected = [];
let result = [];

DEMANDE.map(service => {
  selected.push(DATA.filter(serveur => ((serveur.disk > service.volStock) && (serveur.ram > service.volRam) && (serveur.cores > service.nbrProcess))));
})

selected.map(serviceServers => {
  serviceServers.sort((a, b) => (a.co2production > b.co2production) ? 1 : (a.co2production === b.co2production) ? ((a.co2usage > b.co2usage) ? 1 : -1) : -1)
  result.push(serviceServers)
})

let answer = [];
result.map((serviceServers, id) => {
  if (serviceServers[0] == undefined) {
    answer.push({
      "model": "large3",
      "service": DEMANDE[id].service_name,
    })
  }
  else {
    answer.push({
      "model": serviceServers[0].model,
      "service": DEMANDE[id].service_name,
    })
    console.log("result bets one ", serviceServers[0].model);
  }
})

let resultFinal = [];
answer.forEach(function (item) {
  var existing = resultFinal.filter(function (v, i) {
    return v.model == item.model;
  });
  if (existing.length) {
    var existingIndex = resultFinal.indexOf(existing[0]);
    resultFinal[existingIndex].service = resultFinal[existingIndex].service.concat(item.service);
  } else {
    if (typeof item.service == 'string')
      item.service = [item.service];
    resultFinal.push(item);
  }
});

converter.json2csv(resultFinal, (err, csv) => {
  if (err) {
    throw err;
  }
  fs.writeFileSync('response.csv', csv);
});