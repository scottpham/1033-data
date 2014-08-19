var pymChild = null,
    mobileThreshold = 500,
    aspect_width = 1,
    aspect_height = 1,
    tickNumber = 10
    ;



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
        left: 45
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
            if(d.state == 'CA'){
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

    var dollarFormat = d3.format("$,.1s");
    var shortDollarFormat = d3.format("$,.3s")

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
    //asynchronous call
    d3.csv("state-purchases.csv", type, function(error, data) {
        x.domain([0, d3.max(data, function(d) { return d["2013"]; })]);
        y.domain(data.map(function(d) { return d.state; }));
        //grid
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize((-height - 10), 0, 0)
                .tickFormat("")
            )

        svg.selectAll(".bar")
              .data(data)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("fill", function(d, i) { return barColor(d); })
                //.attr("width", 0)//set width to 0 and then transition below
                .attr("y", function(d){ return y(d.state); })
                .attr("height", y.rangeBand())
                .on("mouseover", function(d) { //tooltip
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    div.html(shortDollarFormat(d[selected]))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) { //make tooltip disappear
                    div.transition()
                        .duration(500)
                        .style("opacity", 0)
                }); 

        //the real width
        svg.selectAll(".bar")
            .transition()
            .attr("width", function(d){ return x(d[selected]); });


        svg.selectAll(".text")
            .data(data)
            .enter().append("text")
                .attr("class", "label")
                .text(function(d) { return "-" + shortDollarFormat(d[selected]); })
                .attr("y", function(d) { return y(d.state) + (y.rangeBand()/2); })
                .attr("x", function(d) { return x(d[selected]) + 3; })
                .attr("dy", 3)
            ;

        
        
        //y axis 
        svg.append("g")
            .attr("transform", "translate(0, 0)")
            .attr("class", "y axis")
            .call(yAxis)
                .attr("text-anchor", "end");

        svg.select(".y.axis")
            .selectAll(".tick")
            .attr("class", function(d, i){ return "tick tick-" + i; } ); //probably not necessary

        //x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, 0)")
            .call(xAxis);
    });

    //coercion function
    function type(d){
        d[selected] = +d[selected];
        d["2013"] = +d["2013"]; //necessary to set domain correctly
        return d;
    }

    if (pymChild) {
        pymChild.sendHeightToParent();
    }

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

//listener on dropdown
d3.select("#dropdown").on("change", function() {
    selected = this.value;
    draw_graphic(selected);

    })




