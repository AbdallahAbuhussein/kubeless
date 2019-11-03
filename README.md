# kubeless
Deploying Kubeless functions using kubernetes cli

# Install CLI (MacOs)
For other operating systems: https://github.com/kubeless/kubeless/releases/
```
wget https://github.com/kubeless/kubeless/releases/download/v1.0.5/kubeless_darwin-amd64.zip
unzip kubeless_darwin-amd64.zip
sudo mv bundles/kubeless_darwin-amd64/kubeless /usr/local/bin
rm -r bundles/
```

# Deploy kubeless
```
kubectl create ns kubeless
kubectl apply -f https://github.com/kubeless/kubeless/releases/download/v1.0.5/kubeless-v1.0.5.yaml 
```

# 2 sample functions:

## NodeJS
```
kubeless function deploy node_function --runtime nodejs6 
                                --dependencies examples/nodejs/package.json \
                                --from-file examples/nodejs/node_function.js \
                                --handler test.node_function
                                
```

```
module.exports = {
  node_function: function (event, context) {
    console.log(event);
    return "Hello from node_function!";
  }
}
```

## Python
```
kubeless function deploy python_function --runtime python2.7 \
                               --from-file examples/python/python_function.py \
                               --handler test.python_function
```

```
def python_function(event, context):
  print event
  return 'Hello from python_function: ' + event
```

### Verify and see all created function
```
kubeless function ls
```
### Call Function
```
kubeless function call node_function --data 'sample data that pass to node_function'
```

```
kubeless function call py_function --data 'sample data to pass to the py_function'
```

Expose node_function over a dns subdomain. (if you are in aws you need to create a subdomain in Hosted zones). "node_function" is the subdomain
```
kubectl apply -f elb-nginx-ingress-controller.yml
kubeless trigger http create myfunction --function-name node_function --hostname node_function.{dns}
```


## PubSub
A Kubeless Trigger represents an event source that functions can be associated with. When an event occurs in the event source, Kubeless will ensure that the associated functions are invoked. 
Kafka-trigger addon to Kubeless adds support for a Kafka streaming platform as a trigger to Kubeless.
### Kafka Installation
```
export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kafka-trigger/releases/latest | grep tag_name | cut -d '"' -f 4)
kubectl create -f https://github.com/kubeless/kafka-trigger/releases/download/$RELEASE/kafka-zookeeper-$RELEASE.yaml
```

#### Deploy function
```
kubeless function deploy to_celsius_function --runtime nodejs6 \
                                --dependencies examples/node/package.json \
                                --handler test.to_celsius_function \
                                --from-file examples/nodejs/to_celsius_function.js
```

```
module.exports = {
  to_celsius_function: function (event, context) {
    var fahrenheit = parseInt(event['data'], 10);
    var celsius = (5/9) * (fahrenheit-32);
    
    console.log(celsius);
    return celsius;
  }
}
```
A Kafka topic can be associated with one or more Kubeless functions. Kubeless functions associated with a topic are triggered as, and when, messages get published to the topic.
#### Trigger and publish
```
kubeless trigger kafka create test --function-selector created-by=kubeless,function=to_celsius_function --trigger-topic to_celsius_function
kubeless topic publish --topic to_celsius_function --data "40"
```

Please refer to the documentation on how to use the Kafka trigger with Kubeless.
https://kubeless.io/docs/pubsub-functions/#kafka
