'user strict'

const azureStorage = require('azure-storage');
const uuid = require('uuid/v1');

const TABLENAME = "ALERT";

const TIME_VALUE = 10000000000000;
const tableService = azureStorage.createTableService(process.env.AAAS_STORAGE_CONNECTION_STRING);
const REST_AP = process.env.AAAS_POWERBI_ALERT_DS;

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
    result.status = data.status;
    result.gateway_time = data.gateway_time;
    if (data.edge_time) {
        result.edge_time = data.edge_time;
    } else if (data.gateway_time) {
        result.edge_time = data.gateway_time;
    } else {
        result.edge_time = data.server_time;
    }
    result.type = 'PENDING';
    if (data.data && data.data.content) {
        if (data.data.content === 'status') {
            result.type = 'STATUS';
        } else if (data.data.content === 'data') {
            result.type = 'DATA';
            result.data = JSON.stringify(data.data);
        }
    }
    result.message = data.message;
    result.server_time = data.server_time;
    return result;
}
module.exports = async function (context, alertMsg) {
    //context.log('JavaScript ServiceBus queue trigger function processed message');
    var item = processMessage(alertMsg);
    let partition = "default";
    if (item) {
        if (item.type) {
            partition = item.type;
        }
        item["PartitionKey"] = partition;
        item["RowKey"] = (TIME_VALUE - Date.parse(item.server_time)) + "_" + uuid();
        item = processStorage(item);
        // Use { echoContent: true } if you want to return the created item including the Timestamp & etag
        tableService.insertEntity(TABLENAME, item, { echoContent: true }, function (error, result, resp) {
            if (!error) {
                console.log('Inserted');
            } else {
                console.error(error.toString());
            }
        });
    }

};