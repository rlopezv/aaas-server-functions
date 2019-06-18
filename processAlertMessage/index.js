'user strict'

const azureStorage = require('azure-storage');
const uuid = require('uuid/v1');
const TABLENAME = "DEVICEMESSAGE";

const tableService = azureStorage.createTableService(process.env.AAAS_STORAGE_CONNECTION_STRING);

module.exports = async function(context, alertMsg) {
    context.log('JavaScript ServiceBus queue trigger function processed message');
    var item = alertMsg;
    let partition = "default";
    if (item) {
        if (alertMsg && alertMsg.type) {
            partition = alertMsg.type;
        }
        item["PartitionKey"] = partition;
        item["RowKey"] = new Date().getTime() + "_" + uuid();
        if (item.data) {
            var measures = Object.keys(item.data);
            measures.forEach(key=> 
                {
                    item[key]=item.data[key];
                });
        }
        item.data = null;
        // Use { echoContent: true } if you want to return the created item including the Timestamp & etag
        tableService.insertEntity(TABLENAME, item, { echoContent: true }, function (error, result, resp) {
            if (!error) {
                console.log(JSON.stringify(resp, result, 2));
            } else {
                console.error(error.toString());
            }
        });
    }

};