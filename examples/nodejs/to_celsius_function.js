module.exports = {
  to_celsius_function: function (event, context) {
    var fahrenheit = parseInt(event['data'], 10);
    var celsius = (5/9) * (fahrenheit-32);
    
    console.log(celsius);
    return celsius;
  }
}

