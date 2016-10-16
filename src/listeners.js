connectButton.addEventListener('click', function () {
  // connectButton.className = ''
  connectButton.textContent = 'Connecting...'
  heartRateSensor.connect()
  .then(() => {
        connectButton.textContent = 'Connected';
        connectButton.className = 'pure-button pure-button-disabled'
        disconnectButton.className = 'pure-button'
        heartRateSensor.startNotificationsHeartRateMeasurement().then(handleHeartRateMeasurement)
  })
  .catch(error => {
    console.log(error)
    connectButton.textContent = 'Error'
  })
})

disconnectButton.addEventListener('click', function() {
  heartRateSensor.stopNotificationsHeartRateMeasurement();
  heartRateSensor.disconnect();
  connectButton.className = 'pure-button pure-button-primary';
  connectButton.textContent = 'Connect'
  disconnectButton.className = 'pure-button pure-button-disabled';
})