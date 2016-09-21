/* global heartRateSensor */

var canvas = document.querySelector('canvas')
var statusText = document.querySelector('#statusText')
var variabilityText = document.querySelector('#variabilityText')
var heartRates = []
var variability = []
const WINDOW_SIZE = 7

statusText.addEventListener('click', function () {
  statusText.className = ''
  statusText.textContent = 'Connecting...'
  heartRates = []
  variability = []
  heartRateSensor.connect()
  .then(() => heartRateSensor.startNotificationsHeartRateMeasurement().then(handleHeartRateMeasurement))
  .catch(error => {
    statusText.textContent = error
  })
})

function handleHeartRateMeasurement (heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    var heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value)
    statusText.innerHTML = heartRateMeasurement.heartRate + ' &#x2764;'
    heartRates.push(heartRateMeasurement.heartRate)
    let v = 0
    if (heartRates.length < WINDOW_SIZE) {
      v = standardDeviation(heartRates)
    } else {
      v = standardDeviation(heartRates.slice(heartRates.length - WINDOW_SIZE))
    }
    variabilityText.innerHTML = v
    variability.push(v)
    drawWaves()
  })
}

canvas.addEventListener('click', event => {
  drawWaves()
})

function average (data) {
  var sum = data.reduce(function (sum, value) {
    return sum + value
  }, 0)
  return sum / data.length
}

function standardDeviation (data) {
  const avg = average(data)
  const squareDiffs = data.map(function (value) {
    var diff = value - avg
    return diff * diff
  })
  const avgSquareDiff = average(squareDiffs)
  return Math.sqrt(avgSquareDiff)
}

function drawWaves () {
  window.requestAnimationFrame(() => {
    canvas.width = parseInt(window.getComputedStyle(canvas).width.slice(0, -2)) * window.devicePixelRatio
    canvas.height = parseInt(window.getComputedStyle(canvas).height.slice(0, -2)) * window.devicePixelRatio

    var context = canvas.getContext('2d')
    var margin = 2
    var max = Math.max(0, Math.round(canvas.width / 11))
    var offset = Math.max(0, variability.length - max)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#FF0000'
    for (let i = 0; i < Math.max(variability.length, max); i++) {
      var barHeight = Math.round(variability[i + offset] * canvas.height / 10)
      context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin))
      context.stroke()
    }
  })
}

window.onresize = drawWaves

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    drawWaves()
  }
})
