const json = require('./input.json');
var fs = require('fs');

let staff = [
  '2010AMBR01',
  '2017MOOR03',
'2010AMBR01',
'2010Hull01',
'2017WOFF01',
'2014GOSL01',
'2018SMIT40',
'2019BEAR03',
'2017HICK03',
'2015TALB01',
'2017WELC01',
'2017LAMB06',
'2015YORK01',
'2017CUZI01',
'2016BITZ01',
'2018HEAT02',
'2017DOVE01',
'2016PILA03',
'2015FERA01',
'2015PADG01',
'2019JOHN03',
'2021ARDN01',
'2014NICH02',
'2017SANK04',
'2017SEOH01',
'2014SHIE03',
'2017HART11',
'2015BEUG01',
'2014STIN01',
'2022LEAV01',
'2010WHIT05',
'2014GRAV02',
'2016MULL04 ',
'2016OCHS01',
'2011DWYE02',
'2022BENN11',
'2015GOSK01',
'2016HART02',
'2017SWOR01',
]

const eventIds = ['333', '222', '444', '555', '666', '777', '333bf', '333oh', 'clock', 'minx', 'pyram', 'skewb', 'sq1', '444bf', '555bf', '333mbf'];

const eventsWithoutJudging = ['444bf', '555bf', '333mbf'];

const stages = [{
  stage: 'red',
  symbol: 'R',
  groups: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
  specialGroups: [{
    eventId: '555',
    groups: [-1, -2, 3, 5]
  },{
    eventId: '333bf',
    groups: [1, 2]
  }]
},{
  stage: 'blue',
  symbol: 'B',
  groups: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  specialGroups: [{
    eventId: '555',
    groups: [1, 2, 4, 6]
  },{
    eventId: '333bf',
    groups: []
  }]
}]

// build event list + max number of groups
let eventList = [];
eventIds.forEach(event => {
  //if first round/group of event exist, then the event exist
  if (json[0][event+'-r1-g1'] !== undefined) {
    for (i = 1; i <= 100; i++) {
      if (i === 100) console.log('error, too many groups')
      if (json[0][event+'-r1-g'+i] === undefined) {

        //then i-1 is the max group
        eventList.push({id: event, maxGroup: i-1});
        i = 101;
      }
    }
  }
});

// map each person to their own 
let newGroupList = json.map(person => {
  let newPerson = { id: person.ID, wcaId: person['WCA ID'] }

  // split name into first/last
  let names = person.Name.split(' ');
  if (names.length === 1) {
    newPerson.firstName = names[0];
    newPerson.lastName = '';
  } else if (names.length === 2) {
    newPerson.firstName = names[0];
    newPerson.lastName = names[1];
  } else if (names.length === 3) {
    newPerson.firstName = names[0];
    newPerson.lastName = names[1] + ' ' + names[2];
  } else {
    newPerson.firstName = names[0] + ' ' + names[1];
    let [,,...lastNames] = names;
    newPerson.lastName = lastNames.join(' ');;
  }

  eventList.forEach(event => {
    //get group assignment
    let competitorGroup = 0;
    for (group=1; group <= event.maxGroup; group++) {
      if (person[event.id + '-r1-g' + group] === 1) {
        competitorGroup = group;
        group = event.maxGroup + 1;
      }
    }
      newPerson[event.id] = competitorGroup;

    // convert group into readable text
    if(competitorGroup > 0) {
      if(stages[0].specialGroups.find(special => special.eventId === event.id)) {
        let stage = stages.find(stage => stage.specialGroups.find(special => special.eventId === event.id).groups.includes(competitorGroup));
        let groupText = stage.symbol + (stage.specialGroups.find(special => special.eventId === event.id).groups.indexOf(competitorGroup) + 1);
        if (!staff.includes(newPerson.wcaId) && !eventsWithoutJudging.includes(event.id)) {
          groupText += '; J-' + stage.symbol;
          if(competitorGroup + 2 > event.maxGroup) {
// Next Group is a little buggy here
            groupText += 1;
          } else {
            groupText += (stage.specialGroups.find(special => special.eventId === event.id).groups.indexOf(competitorGroup) + 2);
          }
        }
        newPerson[event.id] = groupText;
      } else {
        let stage = stages.find(stage => stage.groups.includes(competitorGroup));
        let groupText = stage.symbol + (stage.groups.indexOf(competitorGroup) + 1);
        if (!staff.includes(newPerson.wcaId) && !eventsWithoutJudging.includes(event.id)) {
          groupText += '; J-' + stage.symbol;
          if(competitorGroup + 2 > event.maxGroup) {
          // if(stage.groups.indexOf(competitorGroup) === stage.groups.length - 1) {
            groupText += 1;
          } else {
            groupText += (stage.groups.indexOf(competitorGroup) + 2);
          }
        }
        newPerson[event.id] = groupText;
      }
    } else {
      newPerson[event.id] = '';
    }

  })

  return newPerson;
});

// console.log(newGroupList)
fs.writeFile('output.json', JSON.stringify(newGroupList), 'utf8', (err, data) => {
  if(err) console.log('error: ' + err);
});