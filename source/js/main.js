/*----------------------------------------------------------------------------*\
    $MAIN
\*----------------------------------------------------------------------------*/

var map = {
    init: function(){
        d3.select(window).on("resize", throttle);

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

        var fill = d3.scale.log()
          .domain([10, 500])
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
              .style("fill", function(d, i) { return fill(getRandomInt(10, 500)) });

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
                    data1: 'Goddamn batman',
                    data2: 'Avengers',
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
                    ['data1', 30, 200, 100, 400, 150, 250]
                ],
                type: 'bar',
                colors: {
                    data1: '#009774',
                    data2: '#7fcbb9',
                },
                names: {
                    data1: 'Goddamn batman',
                    data2: 'Avengers'
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
                ['data2', 15, 100, 150, 366, 170, 230],
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

        var words = ['Gift ie', 'Geeft ie', 'Gift'];
        var length = words.length;
        while(length--) {
            if (string.indexOf(words[length])!=-1) {
                // one of the substrings is in yourstring
                $('.js--wrappert').addClass('is-shifted');
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


map.init();
pie.init();
bar.init();
highlightText.init();
giftie.init();
