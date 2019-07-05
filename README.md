

# AAAS API Functions

This respository contains the functions implemented in order to process the messages received from the edge.
It process the messages sent and stores in the correspondent Table Storage Table. At the end of the document is has been included a simplified JSON Schema of the messages received.
The communcation among the functions is done through the queues created. One for every message instance. The function in charge of preproccesing the messages and injecting in the correct queue is the  DeviceMessageDispatcherFunction.
The functions included are:

**processDeviceMessage**, responsible of taking the device message from the queue an injecting it on the correspondent queue for further processing.

**processAlertMessage**, this function will insert the message in the correspondent.

**processStatusMessage**, same as before but with device status messages.

**processTelemetryMessage**, same as before but with telemetry messages.


### TimerTrigger
The `TimerTrigger` are executed based on a schedule. This sample demonstrates a simple use case of calling your function every 5 minutes.

  
### How it works
For a `TimerTrigger` to work, you provide a schedule in the form of a [cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression)(See the link for full details). A cron expression is a string with 6 separate expressions which represent a given schedule via patterns. The pattern we use to represent every 5 minutes is `0 */5 * * * *`. This, in plain text, means: "When seconds is equal to 0, minutes is divisible by 5, for any hour, day of the month, month, day of the week, or year".

 It will take the data from the DB and will push to PowerBI using the API created for the dashboard in order to allow "near real" streaming of data to the dashboard.

## JSON Schemas

### Data messase
**WEATHER**

    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
		  "value": "DATA"
        },
        "application": {
          "type": "string"
        },
        "gateway": {
          "type": "string"
        },
        "gateway_id": {
          "type": "string"
        },
        "device": {
          "type": "string"
        },
        "device_id": {
          "type": "string"
        },
        "device_type": {
          "type": "string"
        },
        "data": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string"
            },
            "humidity": {
              "type": "number"
            },
            "light": {
              "type": "integer"
            },
            "pressure": {
              "type": "number"
            },
            "rain": {
              "type": "integer"
            },
            "temperature": {
              "type": "number"
            },
            "uv": {
              "type": "integer"
            }
          },
          "required": [
            "content",
            "humidity",
            "light",
            "pressure",
            "rain",
            "temperature",
            "uv"
          ]
        },
        "gateway_time": {
          "type": "string",
           "format": "date-time"
       },
        "edge_time": {
          "type": "string",
           "format": "date-time"
        },
        "server_time": {
          "type": "string",
           "format": "date-time"
        }
      },
      "required": [
        "type",
        "application",
        "gateway",
        "gateway_id",
        "device",
        "device_id",
        "device_type",
        "data",
        "gateway_time",
        "edge_time",
        "server_time"
      ]
    }

Plant

    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
		  "value": "DATA"
        },
        "application": {
          "type": "string"
        },
        "gateway": {
          "type": "string"
        },
        "gateway_id": {
          "type": "string"
        },
        "device": {
          "type": "string"
        },
        "device_id": {
          "type": "string"
        },
        "device_type": {
          "type": "string"
        },
        "data": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string"
            },
            "humidity": {
              "type": "number"
            },
            "light": {
              "type": "integer"
            },
            "sm": {
              "type": "integer"
            },
            "temperature": {
              "type": "number"
            }
          },
          "required": [
            "content",
            "humidity",
            "light",
            "sm",
            "temperature"
          ]
        },
        "gateway_time": {
          "type": "string",
           "format": "date-time"
        },
        "edge_time": {
          "type": "string",
           "format": "date-time"
        },
        "server_time": {
          "type": "string",
           "format": "date-time"
        }
      },
      "required": [
        "type",
        "application",
        "gateway",
        "gateway_id",
        "device",
        "device_id",
        "device_type",
        "data",
        "gateway_time",
        "edge_time",
        "server_time"
      ]
    }

### Alert message

    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "application": {
          "type": "string"
        },
        "gateway": {
          "type": "string"
        },
        "gateway_id": {
          "type": "string"
        },
        "device": {
          "type": "string"
        },
        "device_id": {
          "type": "string"
        },
        "device_type": {
          "type": "string"
        },
        "data": {
          "type": "object"
        },
        "message": {
          "type": "string"
        },
        "status": {
          "type": "boolean"
        },
        "edge_time": {
          "type": "string",
           "format": "date-time"
        },
        "gateway_time": {
          "type": "string",
               "format": "date-time"
        },
        "type": {
          "type": "string",
    	   "value": "ALERT"
        },
        "server_time": {
          "type": "string",
               "format": "date-time"
      },
      "required": [
        "application",
        "gateway",
        "gateway_id",
        "device",
        "device_id",
        "device_type",
        "data",
        "message",
        "status",
        "edge_time",
        "gateway_time",
        "type",
        "server_time"
      ]
    }

### Status Message

    {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "application": {
          "type": "string"
        },
        "gateway": {
          "type": "string"
        },
        "gateway_id": {
          "type": "string"
        },
        "device": {
          "type": "string"
        },
        "device_id": {
          "type": "string"
        },
        "device_type": {
          "type": "string"
        },
        "data": {
          "type": "object"
        },
        "message": {
          "type": "string"
        },
        "status": {
          "type": "boolean"
        },
        "edge_time": {
          "type": "string",
               "format": "date-time"
        },
        "gateway_time": {
          "type": "string",
               "format": "date-time"
        },
        "type": {
          "type": "string",
    	   "value": "STATUS"
        },
        "server_time": {
          "type": "string",
               "format": "date-time"
        }
      },
      "required": [
        "application",
        "gateway",
        "gateway_id",
        "device",
        "device_id",
        "device_type",
        "data",
        "message",
        "status",
        "edge_time",
        "gateway_time",
        "type",
        "server_time"
      ]
    }
