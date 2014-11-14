/*----------------------------------------------------------------------------*\
    $MAIN
\*----------------------------------------------------------------------------*/

var map = {
    array2object: function(data){

      var collection = data.slice(); // make a copy
      var key = collection.shift();

      collection = collection.map(function (e) {
          var obj = {};
          obj[key.toLowerCase()] = e;
          return obj;
      });
      return collection[0];
    },

    init: function(results){
        d3.select(window).on("resize", throttle);
        var result = results.rows.map(function(row){ return map.array2object(row)});

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 9])
            .on("zoom", move);


        var width = document.getElementById('js--map').offsetWidth;
        var height = width / 2;

        var topo,projection,path,svg,g;

        var graticule = d3.geo.graticule();

        var tooltip = d3.select("#js--map").append("div").attr("class", "tooltip hidden");

        setup(width,height);

        function setup(width,height){
          projection = d3.geo.mercator()
            .translate([(width/2), (height/2)])
            .scale( width / 2 / Math.PI);

          path = d3.geo.path().projection(projection);

          svg = d3.select("#js--map").append("svg")
              .attr("width", width)
              .attr("height", height)
              .call(zoom)
              .on("click", click)
              .append("g");
              
          g = svg.append("g");

        }

        d3.json("../../js/_data/_data.worldmap.json", function(error, world) {

          var countries = topojson.feature(world, world.objects.countries).features;

          topo = countries;
          draw(topo);

        });

        // Returns a random integer between min (included) and max (excluded)
        // Using Math.round() will give you a non-uniform distribution!
        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }

        function getValueByName(name) {
          //return result[name.toLowerCase()];
          var countries = results.rows.filter(function(row){return row[0].toLowerCase() == name.toLowerCase()});
          if(countries.length === 0){
            console.log("No data for " + name);
            return 0;
          }
          return countries[0] && countries[0][1] ? countries[0][1] : 0;
        }

        var max = Math.max.apply(null, results.rows.map(function(row){return row[1]}));
        var min = Math.min.apply(null, results.rows.map(function(row){return row[1]}));

        var fill = d3.scale.linear()
          .domain([min, max])
          .range(['#e5f4f1', '#009774']);

        function draw(topo) {

          svg.append("path")
             .datum(graticule)
             .attr("class", "graticule")
             .attr("d", path);


          g.append("path")
           .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
           .attr("class", "equator")
           .attr("d", path);


          var country = g.selectAll(".country").data(topo);

          country.enter().insert("path")
              .attr("class", "country")
              .attr("d", path)
              .attr("id", function(d,i) { return d.id; })
              .attr("title", function(d,i) { return d.properties.name; })
              .style("fill", function(d, i) { return fill(getValueByName(d.properties.name)) });

          //offsets for tooltips
          var offsetL = document.getElementById('js--map').offsetLeft+20;
          var offsetT = document.getElementById('js--map').offsetTop+10;

          //tooltips
          country
            .on("mousemove", function(d,i) {

              var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

              tooltip.classed("hidden", false)
                     .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
                     .html(d.properties.name);

              })
              .on("mouseout",  function(d,i) {
                tooltip.classed("hidden", true);
              });
        }


        function redraw() {
          width = document.getElementById('js--map').offsetWidth;
          height = width / 2;
          d3.select('svg').remove();
          setup(width,height);
          draw(topo);
        }


        function move() {

          var t = d3.event.translate;
          var s = d3.event.scale;
          zscale = s;
          var h = height/4;


          t[0] = Math.min(
            (width/height)  * (s - 1),
            Math.max( width * (1 - s), t[0] )
          );

          t[1] = Math.min(
            h * (s - 1) + h * s,
            Math.max(height  * (1 - s) - h * s, t[1])
          );

          zoom.translate(t);
          g.attr("transform", "translate(" + t + ")scale(" + s + ")");

          //adjust the country hover stroke width based on zoom level
          d3.selectAll(".country").style("stroke-width", 1.5 / s);

        }



        var throttleTimer;
        function throttle() {
          window.clearTimeout(throttleTimer);
            throttleTimer = window.setTimeout(function() {
              redraw();
            }, 200);
        }


        //geo translation on mouse click in map
        function click() {
          var latlon = projection.invert(d3.mouse(this));
          console.log(latlon);
        }


        //function to add points and text to the map (used in plotting capitals)
        function addpoint(lat,lon,text) {

          var gpoint = g.append("g").attr("class", "gpoint");
          var x = projection([lat,lon])[0];
          var y = projection([lat,lon])[1];

          gpoint.append("svg:circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("class","point")
                .attr("r", 1.5);

          //conditional in case a point has no associated text
          if(text.length>0){

            gpoint.append("text")
                  .attr("x", x+2)
                  .attr("y", y+2)
                  .attr("class","text")
                  .text(text);
          }

        }

    }
}

var pie = {
    init: function(){
        var chart = c3.generate({
            bindto: '.js--pie',
            data: {
                columns: [
                    ['data1', 30],
                    ['data2', 120],
                ],
                type : 'pie',
                colors: {
                    data1: '#7fcbb9',
                    data2: '#009774',
                },
                names: {
                    data1: 'Nieuw',
                    data2: 'Terugkerend',
                }
            }
        });
    }
};

var bar = {
    init: function (){
        var chart = c3.generate({
            bindto: '.js--bar',
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250, 120, 350]
                ],
                type: 'bar',
                colors: {
                    data1: '#009774',
                    data2: '#7fcbb9',
                },
                names: {
                    data1: 'Bezoek',
                    data2: '% nieuw verkeer'
                }
            },
            bar: {
                width: {
                    ratio: 0.8 // this makes bar width 50% of length between ticks
                }
                // or
                //width: 100 // this makes bar width 100px
            }
        });

        chart.load({
            type: 'line',
            columns: [
                ['data2', 15, 100, 150, 366, 170, 230, 170, 210],
            ]
        });
    }
}


var giftie = {
    init: function() {
        var self = this;
        var $wrapper = $('.js--giftie');
        var $form = $('.js--giftie__form', $wrapper);
        var $input = $('.js--giftie__input', $form);
        var $innerWrap = $('.js--giftie__wrap', $wrapper);
        $form.submit(function(){
            // extract words, mix and match, retrieve information

            // highlight the stuff
            var words = ['Stijging', 'verkeer', 'Dutch Design week'];
            highlightText.highlightWords($input, words);

            var likeAMall = self.alsEenMalle($input.val(), words);
            console.log(likeAMall);

            if (likeAMall === false) {
                // animate the stuff in
                setInterval(function(){
                    $wrapper.addClass('is-active');
                    $innerWrap.addClass('is-active');
                }, 300);
            }
        });

        $input.focus(function(){
            $innerWrap.addClass('is-focus');
        }).focusout(function(){
            $innerWrap.removeClass('is-focus');
        });
    },

    alsEenMalle: function(string){
        var self = this;

        var words = ['Geeft', 'Gift', 'gift', 'geeft'];
        var length = words.length;
        while(length--) {
            if (string.indexOf(words[length])!=-1) {
                // one of the substrings is in yourstring
                $('.js--wrappert').addClass('is-shifted');
                $('.js--wrappert').click(function(){
                    $('.js--wrappert').removeClass('is-shifted');
                });
                return true;
                break;
            }
        }
        return false;
    }
}

var highlightText = {
    init: function(){

    },

    highlightWords: function($element, words){
        $element.highlightTextarea({
            color: '#bfe5dc',
            words: words,
            caseSensitive: false
        });
    }
}


pie.init();
bar.init();
highlightText.init();
giftie.init();

var clientId = '641565182987-fdf1uba1iqp4gpje54hc9kdb0doaovqh.apps.googleusercontent.com';

var apiKey = 'AIzaSyC4X3Q3_VXempuBLnW1Q8rifsf1-9gr15g';

var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

// This function is called after the Client Library has finished loading
function handleClientLoad() {
  // 1. Set the API Key
  gapi.client.setApiKey(apiKey);

  // 2. Call the function that checks if the user is Authenticated. This is defined in the next section
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  // Call the Google Accounts Service to determine the current user's auth status.
  // Pass the response to the handleAuthResult callback function
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // The user has authorized access
    // Load the Analytics Client. This function is defined in the next section.
    loadAnalyticsClient();
  } else {
    // User has not Authenticated and Authorized
    handleUnAuthorized();
  }
}


// Authorized user
function handleAuthorized() {
  $('#authorize-button').addClass('visuallyhidden');
  $('#jsloginvisual').removeClass('visuallyhidden');
  makeApiCall();
}


// Unauthorized user
function handleUnAuthorized() {
  var authorizeButton = document.getElementById('authorize-button');
  var jsLoginVisual = document.getElementById('jsloginvisual');
  // Show the 'Authorize Button' and hide the 'Get Sessions' button
  
  $('#authorize-button').removeClass('visuallyhidden');
  $('#jsloginvisual').addClass('visuallyhidden');
  // When the 'Authorize' button is clicked, call the handleAuthClick function
  authorizeButton.onclick = handleAuthClick;
}

function handleAuthClick(event) {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
}

function loadAnalyticsClient() {
  // Load the Analytics client and set handleAuthorized as the callback function
  gapi.client.load('analytics', 'v3', handleAuthorized);
}

function makeApiCall() {
  queryAccounts();
}

function queryAccounts() {
  console.log('Querying Accounts.');

  // Get a list of all Google Analytics accounts for this user
  gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}

function handleAccounts(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      // Get the first Google Analytics account
      var firstAccountId = results.items[1].id;

      // Query for Web Properties
      queryWebproperties(firstAccountId);

    } else {
      console.log('No accounts found for this user.')
    }
  } else {
    console.log('There was an error querying accounts: ' + results.message);
  }
}

function queryWebproperties(accountId) {
  console.log('Querying Webproperties.');

  // Get a list of all the Web Properties for the account
  gapi.client.analytics.management.webproperties.list({'accountId': accountId}).execute(handleWebproperties);
}

function handleWebproperties(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      // Get the first Google Analytics account
      var firstAccountId = results.items[0].accountId;

      // Get the first Web Property ID
      var firstWebpropertyId = results.items[0].id;

      // Query for Views (Profiles)
      queryProfiles(firstAccountId, firstWebpropertyId);

    } else {
      console.log('No webproperties found for this user.');
    }
  } else {
    console.log('There was an error querying webproperties: ' + results.message);
  }
}

function queryProfiles(accountId, webpropertyId) {
  console.log('Querying Views (Profiles).');

  // Get a list of all Views (Profiles) for the first Web Property of the first Account
  gapi.client.analytics.management.profiles.list({
      'accountId': accountId,
      'webPropertyId': webpropertyId
  }).execute(handleProfiles);
}

function handleProfiles(results) {
  if (!results.code) {
    if (results && results.items && results.items.length) {
      // Get the first View (Profile) ID
      var firstProfileId = results.items[1].id;

      // Step 3. Query the Core Reporting API
      queryCoreReportingApi(firstProfileId);

    } else {
      console.log('No views (profiles) found for this user.');
    }
  } else {
    console.log('There was an error querying views (profiles): ' + results.message);
  }
}

function queryCoreReportingApi(profileId) {
  console.log('Querying Core Reporting API.');

  // Use the Analytics Service Object to query the Core Reporting API
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:' + profileId,
    'dimensions': 'ga:country',
    'metrics': 'ga:goalCompletionsAll',
    'start-date': '2011-11-14',
    'end-date': '2014-11-14'
  }).execute(handleCoreReportingResults);
}

function handleCoreReportingResults(results) {
  if (results.error) {
    console.log('There was an error querying core reporting API: ' + results.message);
  } else {
    printResults(results);
  }
}

function printResults(results) {
  if (results.rows && results.rows.length) {
    map.init(results);
  } else {
    console.log('No results found');
  }
}
