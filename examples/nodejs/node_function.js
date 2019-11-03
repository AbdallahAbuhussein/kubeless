module.exports = {
  node_function: function (event, context) {
    console.log(event);
    return "Hello from node_function!";
  }
}
