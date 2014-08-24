var pymChild = null,
    mobileThreshold = 500,
    aspect_width = 1,
    aspect_height = 1,
    tickNumber = 10
    ;

var dollarFormat = d3.format("$.2s"),
    shortDollarFormat = d3.format("$,.3s")


var $graphic = $('#graphic');

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * Render the graphic
 */
//check for svg
function draw_graphic(selected){
    if (Modernizr.svg){
        $graphic.empty();

    var selected = d3.select("#dropdown") //store dropdownin array
    render(selected[0][0].value); //get value of dropdown

    }
}

function render(selected) {

    //standard margins
    var margin = {
        top: 30,
        right: 50,
        bottom: 20,
        left: 135
    };

    //find width of container
    var width = $('#graphic').width() - margin.left - margin.right;

    var mobile = {};
    //check for mobile
    function ifMobile (w) {
        if(w < mobileThreshold){
            tickNumber = 5;
        }
        else{
            tickNumber = 10;
        }
    } 
    //call mobile check
    ifMobile(width);


    //highlight California
    function barColor(d){
            if(d.state == 'CALIFORNIA'){
                return colors.red1;
        }
            else{
                return colors.blue1;
            }
    }

    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    if(height < 550){ height = 550;} //can't let it get lower or becomes unreadable

    var x = d3.scale.linear().range([0, width]),
        y = d3.scale.ordinal().rangeRoundBands([0, height], 0.15);


    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(tickNumber)
        .tickFormat(dollarFormat)
        .orient("top")
        .tickSize(5, 0, 0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(5, 0, 0);

    var svg = d3.select("#graphic").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //tooltip
    var div = d3.select("#graphic").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //gridlines
    var make_x_axis = function() { 
        return d3.svg.axis()
            .scale(x)
                .orient("bottom")
                .ticks(tickNumber)
            }

    //asynchronous csv call
    d3.csv("full-state-data.csv", type, function(error, data) {
        x.domain([0, d3.max(data, function(d) { return d[selected]; })]);
        //y.domain(data.map(function(d) { return d.state; })); real y.domain
        y.domain(data.sort( function(a, b) { return b[selected] - a[selected]; })
                        .map(function(d) { return d.state; }));

        //grid
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize((-height - 10), 0, 0)
                .tickFormat("")
            )

        //build out bars
        svg.selectAll(".bar")
              .data(data)
            .enter().append("rect")
                .attr("class", function(d,i){ return "bar bar-" + i;} )
                .attr("x", 0)
                .attr("fill", function(d, i) { return barColor(d); })
                .attr("width", function(d){ return x(d[selected]); })
                .attr("y", function(d){ return y(d.state); })
                .attr("height", y.rangeBand())
                //event handlers
                .on("mouseover", function(d, i) {
                    svg.selectAll(".label-" + i).transition().duration(100)
                        .style("fill", "black")
                        .style("font", "12px sans-serif");
                    svg.selectAll(".tick-" + i).transition().duration(100)
                        .style("fill", "black")
                        .style("font", "12px sans-serif");
                    svg.selectAll(".bar-" + i).transition().duration(100)
                        .style("opacity", "0.75");
                    })
                .on("mouseout", function(d, i) {
                    svg.selectAll(".label-" + i).transition().duration(100)
                        .style("fill", "gray")
                        .style("font", "10px sans-serif");
                    svg.selectAll(".tick-" + i).transition().duration(100)
                        .style("fill", "gray")
                        .style("font", "10px sans-serif");
                    svg.selectAll(".bar-" + i).transition().duration(100)
                        .style("opacity", "1");
                }); 
            
        //add bar labels
        svg.selectAll(".label")
            .data(data)
            .enter().append("text")
                .attr("class", function(d, i){ return "label label-" + i; } )
                .text(function(d) { return "-" + shortDollarFormat(d[selected]); })
                .attr("y", function(d) { return y(d.state) + (y.rangeBand()/2); })
                .attr("x", function(d) { return x(d[selected]) + 3; })
                .attr("dy", 3);

        //y axis 
        svg.append("g")
            .attr("transform", "translate(0, 0)")
            .attr("class", "y axis")
            .call(yAxis)
                .attr("text-anchor", "end");

        //mouseover effects for y axis
        svg.select(".y.axis")
            .selectAll(".tick")
            .attr("class", function(d, i){ return "tick tick-" + i; } )
            .on("mouseover", function(d, i) { 
                    //hover effect - self
                svg.selectAll(".tick-" + i).transition().duration(100)
                    .style("fill", "black")
                    .style("font", "12px sans-serif");
                    //hover effect - labels
                svg.selectAll(".label-" + i).transition().duration(100)
                    .style("fill", "black")
                    .style("font", "12px sans-serif");
                    //hover effect - bars
                svg.selectAll(".bar-" + i).transition().duration(100)
                        .style("opacity", "0.75");
                    })
            .on("mouseout", function(d, i) { //make hover disappear
                svg.selectAll(".label-" + i).transition().duration(100)
                    .style("fill", "gray")
                    .style("font", "10px sans-serif");
                 //hover effect - bars
                svg.selectAll(".bar-" + i).transition().duration(100)
                    .style("opacity", "1");
                svg.selectAll(".tick-" + i).transition().duration(100)
                    .style("fill", "gray")
                    .style("font", "10px sans-serif");
            })

        //x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, 0)")
            .call(xAxis);

        ///dropdown////////////
    d3.select("#dropdown").on("change", function() {

       $('#graphic').addClass('no-mouse');

        selected = this.value;

        data.forEach(function(d) {
        d[selected] = +d[selected];
        });

        //highlight x axis ticks for a moment
        svg.select(".x.axis").selectAll("text")
            .style("fill", "black")
            .style("font", "12px sans-serif");

        //initial bar transition w/ old scale
        svg.selectAll(".bar")
            .data(data)
            .transition()
            .duration(300)
            .attr("width", function(d){ return x(d[selected]); });
        
        //label transition fade out
        svg.selectAll(".label")
                .transition()
                .duration(300)
                .style("opacity", "0")
                .attr("x", function(d) { return x(d[selected]) + 3; });
        
        //change scale to selected
        x2 = x.copy();
        x2 = x.domain([0, d3.max(data, function(d) { return d[selected]; })]);


        //transition scale, reset x axis
        svg.transition().duration(2500).delay(250)
          .ease("quad")
          .select(".x.axis")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "gray")
            .style("font", "10px sans-serif");

        //call grid
        svg.transition().duration(2500).delay(250)
          .ease("quad")
          .selectAll(".grid")
            .call(make_x_axis()
                .tickSize((-height - 10), 0, 0)
                .tickFormat(""));

        //resize bars again
        svg.selectAll(".bar")
            .data(data)
                .transition()
                .duration(1500)
                .delay(1500)
                .attr("width", function(d){ return x2(d[selected]); });

        //reposition labels again
        svg.selectAll(".label")
            .data(data)
                .transition()
                .duration(1500)
                .delay(1500)
                .style("opacity", "1")
                .attr("x", function(d) { return x2(d[selected]) + 3; })
                .text(function(d) { return "-" + shortDollarFormat(d[selected]); });

        setTimeout(function() {
                $('#graphic').removeClass('no-mouse')}, 3000);
                
    });



    
    //end of csv call function
    });

    //coercion function
    function type(d){
        d[selected] = +d[selected];
        d["2011"] = +d["2011"]; //necessary to set domain correctly
        return d;
    }

    if (pymChild) {
        pymChild.sendHeightToParent();
    }


    //button sort cash
    d3.select('#descend').on("click", function() {

        $('#graphic').addClass('no-mouse');

        setTimeout(function() {
                $('#graphic').removeClass('no-mouse')}, 550 + 15*55);

        d3.csv("full-state-data.csv", type, function(error, data) {

            //sort domain by column year and map onto state
            var ySort = y.domain(data.sort( function(a, b) { return b[selected] - a[selected]; })
                        .map(function(d) { return d.state; }));

            var transition = svg.transition().duration(550),
                delay = function(d, i){ return i * 15;}; 

            transition.selectAll(".bar")
                .attr("y", function(d){ return ySort(d.state); })
                .delay(delay)
                .attr("fill", function(d, i) { return barColor(d); });

            transition.selectAll(".label")
                    .attr("y", function(d) { return ySort(d.state) + y.rangeBand()/2; })
                    .delay(delay);
            
            transition.select(".y.axis")
                    .call(yAxis)
                .selectAll(".tick")
                    .delay(delay);
        })
    })

    //button sort alpha
    d3.select('#alpha').on("click", function() {

        $('#graphic').addClass('no-mouse');

        d3.csv("full-state-data.csv", type, function(error, data) {
            //original alpha sort
            y.domain(data.map(function(d) { return d.state; }));

            var transition = svg.transition().duration(550),
                delay = function(d, i){ return i * 15;}; 

            transition.selectAll(".bar")
                .attr("y", function(d){ return y(d.state); })
                .delay(delay)
                .attr("fill", function(d, i) { return barColor(d); });

            transition.selectAll(".label")
                    .attr("y", function(d) { return y(d.state) + y.rangeBand()/2; })
                    .delay(delay);
            
            transition.select(".y.axis")
                    .call(yAxis)
                .selectAll(".tick")
                    .delay(delay);

            setTimeout(function() {
                $('#graphic').removeClass('no-mouse')}, 550 + 15*55);

         })
    })

    //button sort size
    d3.select('#size').on("click", function() {

        $('#graphic').addClass('no-mouse');

        setTimeout(function() {
                $('#graphic').removeClass('no-mouse')}, 550 + 15*55);

        d3.csv("full-state-data.csv", type, function(error, data) {

            //sort by column
            y.domain(data.sort( function(a, b) { return b.Population - a.Population; })
                .map(function(d) { return d.state; }));

            var transition = svg.transition().duration(550),
                delay = function(d, i){ return i * 15;}; 

            transition.selectAll(".bar")
                .attr("y", function(d){ return y(d.state); })
                .delay(delay)
                .attr("fill", function(d, i) { return barColor(d); });

            transition.selectAll(".label")
                    .attr("y", function(d) { return y(d.state) + y.rangeBand()/2; })
                    .delay(delay);
            
            transition.select(".y.axis")
                    .call(yAxis)
                .selectAll(".tick")
                    .delay(delay);
        });
    });





//end function render    
}
/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    if (Modernizr.svg){
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    }
    else { pymChild = new pym.Child();
    }
})






