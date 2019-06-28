const azureStorage = require('azure-storage');

const EXCLUDED_DATA = ['gw_time','type'];
const TIMESTAMPFIELDS = ['gateway_time','gw_time','edge_time'];


function processData(data) {
    var result = {};
    let content;
    if (typeof data === 'string') {
        content = JSON.parse(data);
    } else if (typeof data === 'object') {
        content = data;
    }
    for (const key in content) {
        if (EXCLUDED_DATA.indexOf(key)<0) {
            result[key] = content[key];
        }
    }
    return result;
}

function processMessage(data) {
    var result = data;
    //PROCESS TIMESTAMPFIELDS
    for (const timeField of TIMESTAMPFIELDS) {
        if (data[timeField]) {
            let val = data[timeField];
            if (typeof val === 'number') {
                val = new Date(val);
            } else if (typeof val === 'string') {
                if (/^\d+$/.test(val)) {
                    val = new Date(Number.parseInt(val));
                } else {
                    val = new Date(Date.parse(val));
                }
                
            }
            data[timeField] = val;
        }
    }
    return result;
}


module.exports = async function(context, queueMsg) {
    console.log(`Device message %s`,queueMsg);
    var item;
    if (queueMsg.type) {
        item = processMessage(queueMsg);
        item.server_time = new Date();
        if (item.data) {
            try {
                item.data = processData(item.data);
            } catch (e) {
                console.error(e);
            }
        }
    }
    if (item) {
        switch (item.type) {
             case 'STATUS': context.bindings.outputStatusQueue = item;
                 break;
             case 'DATA': context.bindings.outputTelemetryQueue = item;
                 break;
             case 'ALERT': context.bindings.outputAlertQueue = item;
                   break;
        }
    }
};