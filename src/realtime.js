
var margin = {top: 20, right: 80, bottom: 30, left: 50},
width = parseInt(d3.select("#graph").style("width")) - margin.left - margin.right,
height = parseInt(d3.select("#graph").style("height")) - margin.top - margin.bottom;

var bpm_data = []
var intervals = []

var hrv_data = [
    {'id': 'hrv20', 'window_size': 20, 'color': '#006d2c', 'data': []},
    {'id': 'hrv40', 'window_size': 40, 'color': '#31a354', 'data': []},
    {'id': 'hrv60', 'window_size': 60, 'color': '#74c476', 'data': []}
]

var limit = 60 * 1;
var duration = 750;
var now = Date.now();
var minute = 60 * 1000; // in millis
var x_begin = now - minute;

/* Scales */

var x = d3.time.scale().domain([x_begin, now]).range([0, width])
var y = d3.scale.linear().domain([25, 120]).range([height, 0])

var hrv = d3.scale.linear().domain([0, 200]).range([height, 0])

var bpm_line = d3.svg.line()
    .x(function(d){
        return x(d['time']);
    })
    .y(function(d){
        return y(d['bpm']);
    });

var hrv_line = d3.svg.line()
    .x(function(d){
        return x(d['time']);
    })
    .y(function(d){
        return hrv(d['hrv']);
    });

var svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
/* Axes */

var axis = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(x.axis = d3.svg.axis().scale(x).orient('bottom'))

var bpmAxis = d3.svg.axis().scale(y).orient("left");
var hrvAxis = d3.svg.axis().scale(hrv).orient("right");

svg.append("g")
  .attr("class", "bpm axis")
  .call(bpmAxis)
.append("text")
  .attr("class", "label")
  .attr("y", 6)
  .attr("dy", ".71em")
  .attr("dx", ".71em")
  .style("text-anchor", "beginning")
  .text("BPM");

svg.append("g")
  .attr("class", "hrv axis")
  .attr('transform', 'translate(' + width + ',0)')
  .call(hrvAxis)
.append("text")
  .attr("class", "label")
  .attr("y", 6)
  .attr("dy", ".71em")
  .attr("dx", ".71em")
  .style("text-anchor", "beginning")
  .text("HRV");


svg.append("path")
    .attr("id", "bpm_line")
    .attr("d", function(d) {return bpm_line(bpm_data); })
    .style("stroke", "red");


hrv_data.forEach(function(hrv_group){
    svg.append("path")
       .attr("id", hrv_group.id)
       .attr("d", function(d) {return hrv_line(hrv_group['data']);})
       .style("stroke", hrv_group.color)
});

function tick(time) {
    diff = time - now
    now = time
    x_begin = x_begin + diff

    // Shift domain
    x.domain([x_begin, now]);

    // Remove values older than the axis begin
    if (bpm_data.length > 0) {
        while (bpm_data[0]['time'] < x_begin) {
            bpm_data.shift()
        }
    }

    hrv_data.forEach(function(hrv_group){
        if (hrv_group['data'].length > 0) {
            while (hrv_group['data'][0]['time'] < x_begin) {
                hrv_group['data'].shift();
            }
        }
        svg.selectAll('#' + hrv_group.id)
           .attr("d", function(d) { return hrv_line(hrv_group['data']); });
    });

    // Slide x-axis left
    axis.transition()
        .duration(duration)
        .ease('linear')
        .call(x.axis)

    svg.selectAll('#bpm_line')
       .attr("d", function(d) { return bpm_line(bpm_data); });
}

/* Data Handler */

function recordBPM(measurement) {
    bpm_data.push(measurement);
}

function recordInterval(interval, time) {
    intervals.push({'time': time, 'interval': interval});
}

function computeHRV(time, window_size) {
    if (intervals.length > window_size) {
        var interval_window = intervals.slice(intervals.length - window_size).map(function(d){return d['interval'];});
        var std = standardDeviation(interval_window);
        return {'time': time, 'hrv': std};
    }
}

function handleHeartRateMeasurement (heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    var measurement = heartRateSensor.parseHeartRate(event.target.value)
    var measurement_time = Date.now()
    recordBPM({'time': measurement_time, 'bpm': measurement.heartRate});
    measurement.rrIntervals.forEach(function(interval){
        recordInterval(interval, measurement_time);
    });
    hrv_data.forEach(function(hrv_group){
        var point = computeHRV(measurement_time, hrv_group.window_size);
        if (point != null) {
            hrv_group.data.push(point);
        }
    });
    tick(measurement_time)
  })
}
