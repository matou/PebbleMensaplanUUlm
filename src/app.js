var UI = require('ui');
var ajax = require('ajax');
var Feature = require('platform/feature');

var mensaplanURL = 'https://www.uni-ulm.de/mensaplan/data/mensaplan.json';
var mensaplanStaticURL = 'https://www.uni-ulm.de/mensaplan/data/mensaplan_static.json';

var fetchedStatic = false;
var fetchedDynamic = false;

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

// Display information that data is downloading
var loadingCard = new UI.Card({
  title:'Mensaplan',
  subtitle:'\nFetching data...'
});
loadingCard.show();

var errorCard = new UI.Card({ 
  title:'Error',
  body:'Could not fetch data. Internet connection?'
});

var fkeys = Object.keys(facilities);

for (var i=0; i<fkeys.length; i++) {
  facilityItems.push({
    title:fkeys[i]
  });
}


console.log('starting download');

// Download dynamic mensaplan
ajax({ url: mensaplanURL, type: 'json' }, 
  function(data) {
    
    // find the current week
    var week = 0;
    var weeknum = 100;
    for (var i=0; i<data.weeks.length; i++) {
      if (data.weeks[i].weekNumber < weeknum) {
        week = i;
        weeknum = data.weeks[i].weekNumber;
      }
    }
    
    myPlan.days = data.weeks[week].days;
    fetchedDynamic = true;
    console.log('fetched dynamic data');
    showFacilities();
  },
  function(error) {
    errorCard.show();
    loadingCard.hide();
    console.log('Failed fetching mensaplan data: ' + error);
  }
);

// Download static mensaplan
console.log('now downloading static data');
ajax({ url: mensaplanStaticURL, type: 'json' },
  function(data) {
    // merge static data with dynamic
    for (var i=0; i<5; i++) {
      myPlan.days[i].Burgerbar = data.weeks[0].days[i].Burgerbar;
      myPlan.days[i].Diner = data.weeks[0].days[i].Diner;
    }
    fetchedStatic = true;
    console.log('fetched static data');
    showFacilities();
  },
  function(error) {
    errorCard.show();
    loadingCard.hide();
    console.log('Failed fetching static mensaplan data: ' + error);
  } 
);


function showFacilities() {
  console.log('static data present: ' + fetchedStatic);
  console.log('dynamic data present: ' + fetchedDynamic);
  
  // Are we ready to display the plan (i.e. all data fetched)?
  if (!fetchedStatic || !fetchedDynamic) 
    return;
  
  var facilityMenu = new UI.Menu({
    highlightBackgroundColor: Feature.color('Dark Green', 'black'),
    sections: [{
      title: 'Mensa auswählen',
      items: facilityItems
    }]
  });
  facilityMenu.show();
  loadingCard.hide();
  
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
  
  showItems(items, facility);
}


function showItems(items, facility) {
  var mealMenu = new UI.Menu({
    highlightBackgroundColor: Feature.color('Dark Green', 'black'),
    sections: [{
      title: facility,
      items: items
    }]
  });
  
  mealMenu.show();
  
  mealMenu.on('select', function(e) {
    var detailCard = new UI.Card({
      title:items[e.itemIndex].title,
      body:items[e.itemIndex].subtitle,
      scrollable:true
    }); 
    detailCard.show();
  });
}