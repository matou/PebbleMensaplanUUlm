var UI = require('ui');

var ajax = require('ajax');

var mensaplanURL = 'https://www.uni-ulm.de/mensaplan/data/mensaplan.json';
var mensaplanStaticURL = 'https://www.uni-ulm.de/mensaplan/data/mensaplan_static.json';

var myPlan = {};

var today = new Date();
var weekday = today.getDay() - 1; // mensaplan starts on monday, while date starts on sunday

var facilities = {'Mensa':'Mensa', 
                  'Bistro':'Bistro', 
                  'Cafeteria Nord':'CB',
                  'Cafeteria West':'West', 
                  'Mensa Hochschule':'Prittwitzstr',
                  'Burgerbar SouthSide':'Burgerbar',
                  'WestSideDiner':'Diner'};

var facilityItems = [];
var fkeys = Object.keys(facilities);

for (var i=0; i<fkeys.length; i++) {
  facilityItems.push({
    title:fkeys[i]
  });
}


// Display information that data is downloading
var card = new UI.Card({
  title:'Mensaplan',
  subtitle:'\nFetching data...'
});
card.show();

var errorCard = new UI.Card({ 
  title:'Error',
  body:'Could not fetch data. Internet connection?'
});


console.log('starting download');

// Download dynamic mensaplan
ajax({ url: mensaplanURL, type: 'json', async: false },
  function(data) {
    myPlan.days = data.weeks[1].days;
    console.log('Finished fetching dynamic data.');    
  },
  function(error) {
    errorCard.show();
    card.hide();
    console.log('Failed fetching mensaplan data: ' + error);
  }
);

// Download static mensaplan
console.log('now downloading static data');
ajax({ url: mensaplanStaticURL, type: 'json', async: false },
  function(data) {
    for (var i=0; i<5; i++) {
      myPlan.days[i].Burgerbar = data.weeks[0].days[i].Burgerbar;
      myPlan.days[i].Diner = data.weeks[0].days[i].Diner;
    }
  },
  function(error) {
    errorCard.show();
    card.hide();
    console.log('Failed fetching static mensaplan data: ' + error);
  } 
);

showFacilities();

function showFacilities() {
  
  var facilityMenu = new UI.Menu({
    sections: [{
      title: 'Mensa auswählen',
      items: facilityItems
    }]
  });
  facilityMenu.show();
  card.hide();
  
  facilityMenu.on('select', function(e) {
    showPlan(facilities[fkeys[e.itemIndex]]);
  });
}

function showPlan(facility) {
  console.log(facility);
  
  //var plan = mensaplanJSON.weeks[1].days[weekday][facility].meals;
  var plan = myPlan.days[weekday][facility].meals;
  var items = [];
  
  for (var i=0; i<plan.length; i++) {
    items.push({
      title:plan[i].category,
      subtitle:plan[i].meal
    });
  }
  
  showItems(items);
}


function showItems(items) {
  var mealMenu = new UI.Menu({
    sections: [{
      title: 'Mensaplan',
      items: items
    }]
  });
  
  mealMenu.show();
  
  mealMenu.on('select', function(e) {
    var detailCard = new UI.Card({
      title:items[e.itemIndex].title,
      body:items[e.itemIndex].subtitle
    }); 
    detailCard.show();
  });
}