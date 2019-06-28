const azureStorage = require('azure-storage');
const uuid = require('uuid/v1');
const PLANT_TABLENAME = "TELEMETRYPLANT";
const WEATHER_TABLENAME = "TELEMETRYWEATHER";

const TIME_VALUE = 10000000000000;
const tableService = azureStorage.createTableService(process.env.AAAS_STORAGE_CONNECTION_STRING);

const EXCLUDED_DATA = ['content'];

const TIMESTAMP_FIELDS = ['edge_time','gateway_time','server_time'];
function processStorage(data) {
    var result = data;
    for (const fieldName of TIMESTAMP_FIELDS) {
        if (data[fieldName]) {
            data[fieldName] = new Date(Date.parse(data[fieldName]));
        }
    }
    return result;
}

function processMessage(data) {
    var result = {};
    result.device = data.device;
    result.application = data.application;
    result.gateway = data.gateway;
    result.device_id = data.device_id;
    result.device_type = data.device_type;
    result.gateway_time = data.gateway_time;
    if (data.edge_time) {
        result.edge_time = data.edge_time;
    } else if (data.gateway_time) {
        result.edge_time = data.gateway_time;
    } else {
        result.edge_time = data.server_time;
    }
    result.type = data.device_type;
    if (data.data) {
        var content = data.data;
        for (const key in content) {
            if (EXCLUDED_DATA.indexOf(key)<0) {
                result[key] = content[key];
            }
        }        
    }
    //Process Data Values
    result.message = data.message;
    result.server_time = data.server_time;
    return result;
}

module.exports = async function(context, telemetryMsg) {
    //context.log('JavaScript ServiceBus queue trigger function processed message', telemetryMsg);
    var item = processMessage(telemetryMsg);
    let partition = "default";
    let tableName;
    if (item) {
        if (item.type) {
            switch (item.type) {
                case 'PLANT': tableName = PLANT_TABLENAME;
                break;
                case 'WEATHER': tableName = WEATHER_TABLENAME;
                break;
            }
        }
        if (item.device) {
            partition = item.device;
        }
        if (tableName) {
            item["PartitionKey"] = partition;
            item["RowKey"] = (TIME_VALUE - Date.parse(item.server_time)) + "_" + uuid();
            item = processStorage(item);
            // Use { echoContent: true } if you want to return the created item including the Timestamp & etag
            tableService.insertEntity(tableName, item, { echoContent: true }, function (error, result, resp) {
                if (!error) {
                     console.log('Inserted');
                } else {
                    console.error(error.toString());
                }
            });
        }
    }

};