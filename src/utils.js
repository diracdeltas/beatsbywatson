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