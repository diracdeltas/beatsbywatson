// var margin = {top: 20, right: 80, bottom: 30, left: 50},
// width = parseInt(d3.select("#graph").style("width")) - margin.left - margin.right,
// height = parseInt(d3.select("#graph").style("height")) - margin.top - margin.bottom;

var margin = 80;
var width = parseInt(d3.select("#graph").style("width")) - (2 * margin);
var height = parseInt(d3.select("#graph").style("height")) - (2 * margin);

var side = Math.min(width, height)

var intervals = []
const limit = 100

var nn0_scale = d3.scale.linear().domain([0, 2000]).range([0, side])
var nn1_scale = d3.scale.linear().domain([0, 2000]).range([side, 0])
var time_scale = d3.scale.linear().domain([0, limit]).range(['black', 'red'])

// var svg = d3.select("#chart")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//             .append("g")
//             .attr("width", side)
//             .attr("height", side)
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg = d3.select("#chart")
						.attr("width", side + 2 * margin)
						.attr("height", side + 2 * margin)
						.append("g")
						.attr("transform", "translate(" + margin + "," + margin + ")");

var nn0_axis = d3.svg.axis().scale(nn0_scale).orient("bottom");
var nn1_axis = d3.svg.axis().scale(nn1_scale).orient("left");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + side + ")")
    .call(nn0_axis)

svg.append("g")
    .attr("class", "y axis")
    .call(nn1_axis)
  .append("text")
    .attr("class", "label")
    .attr("y", 6)
    .attr("dy", ".71em")
    .attr("dx", ".71em")
    .style("text-anchor", "beginning")
    .text("NN_1");


function drawCircles() {
	// time_scale = d3.scale.linear().domain([0, intervals.length]).range(['black', 'red'])

	svg.selectAll("circle")
	 .data(intervals)
	 .enter()
	 .append("circle")
	 .attr("cx", function(d){return nn0_scale(d.nn0)})
	 .attr("cy", function(d){return nn1_scale(d.nn1)})
	 .attr("r", 3);
	 // .attr("style", function(d, i){return "fill:" + time_scale(i)});
}

function recordInterval(interval) {
	if (intervals.length == 0) {
		intervals.push({nn0: interval, nn1: interval})
	} else {
		var previous = intervals[intervals.length - 1].nn1
		intervals.push({nn0: previous, nn1: interval})
	}
	if (intervals.length > limit) {
		intervals.shift();
	}
	drawCircles();
}

function handleHeartRateMeasurement (heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    var measurement = heartRateSensor.parseHeartRate(event.target.value)
    measurement.rrIntervals.forEach(recordInterval);
    console.log("intervals: " + measurement.rrIntervals);
  })
}
