const azure = require('azure-storage');
const request = require('request');

const tableService = azure.createTableService(process.env.AAAS_STORAGE_CONNECTION_STRING);
const ALERT_TABLE = "ALERT";
const STATUS_TABLE = "STATUS";
const WEATHER_TELEMETRY_TABLE = "TELEMETRYWEATHER";
const PLANT_TELEMETRY_TABLE = "TELEMETRYPLANT";
const MAX_ROWS = 20;

const PERIOD = 0 * 1000;

const WEATHER_TELEMETRY_COLUMNS = ['device', 'gateway_time', 'edge_time', 'temperature', 'humidity', 'pressure', 'light', 'uv', 'rain'];
const PLANT_TELEMETRY_COLUMNS = ['device', 'gateway_time', 'edge_time', 'temperature', 'humidity', 'light', 'sm'];
const STATUS_COLUMS = ['device', 'gateway_time', 'edge_time', 'status'];

const TIME_VALUE = ['gateway_time', 'edge_time'];

function publish(API_ENDPOINT, data) {
    request.post(API_ENDPOINT,
        { json: data },
        function (error, response, body) {
            console.log(`Sent to %s`,API_ENDPOINT);
            if (response) {
                console.log(`Response code %d`,response.statusCode);
            }
            if (!error) {
                console.log(`Sent %d rows`,data.length);
            } else {
                console.error(error.message);
            }

        });
    return true;
}


function processResultStatus(data, columns) {
    var result = [];
    var devices = [];
    for (const row of data) {
        if (devices.indexOf(row.device)<0) {
        devices.push(row.device);
        var element = {};
        for (const key of columns) {
            if (typeof row[key] === 'boolean') {
                element[key] = row[key]?1:0;
            } else {
                element[key] = row[key];
            }
            if (TIME_VALUE.indexOf(key) >= 0) {
                if (element[key]) {
                    element[key] = new Date(Date.parse(element[key]));
                } else {
                    element[key] = new Date();
                }
                element[key] = new Date();
            }
        }
        result.push(element);
    }
    }
    return result;
}

function processResultData(data, columns) {
    var result = [];
    for (const row of data) {
        var element = {};
        for (const key of columns) {
            if (typeof row[key] === 'boolean') {
                element[key] = row[key]?1:0;
            } else {
                element[key] = row[key];
            }
            if (TIME_VALUE.indexOf(key) >= 0) {
                if (element[key]) {
                    element[key] = new Date(Date.parse(element[key]));
                } else {
                    element[key] = new Date();
                }
                element[key] = new Date();
            }
        }
        result.push(element);
    }
    return result;
}

function processQuery(tableName, query, processCallback) {
    tableService.queryEntities(tableName, query, null, function (error, result, response) {
        if (!error) {
            processCallback(response.body.value);
        } else {
            console.log(`Error %s`, error.message);
        }
    });
    return true;
}

function processPlantTelemetryResponse(data) {
    if (data && data.length > 0) {
        publish(process.env.AAAS_POWERBI_PLANT_TELEMETRY_API, processResultData(data, PLANT_TELEMETRY_COLUMNS));
    } else {
        console.log("No data to send for plants");
    }
    return true;
}

function processWeatherTelemetryResponse(data) {
    if (data && data.length > 0) {
        publish(process.env.AAAS_POWERBI_WEATHER_TELEMETRY_API, processResultData(data, WEATHER_TELEMETRY_COLUMNS));
    } else {
        console.log("No data to send for weather");
    }
    return true;
}

function processStatusResponse(data) {
    if (data && data.length > 0) {
        publish(process.env.AAAS_POWERBI_STATUS_API, processResultStatus(data, STATUS_COLUMS));
    } else {
        console.log("No data to send for status");
    }
    return true;
}

function processPlantTelemetry(serverTime) {
    var query = new azure.TableQuery().top(MAX_ROWS).where('Timestamp > ?', serverTime);
    processQuery(PLANT_TELEMETRY_TABLE, query, processPlantTelemetryResponse);
    return true;
}

function processWeatherTelemetry(serverTime) {
    var query = new azure.TableQuery().top(MAX_ROWS).where('Timestamp > ?', serverTime);
    processQuery(WEATHER_TELEMETRY_TABLE, query, processWeatherTelemetryResponse);
    return true;
}

function processStatus(serverTime) {
    var query = new azure.TableQuery().top(MAX_ROWS).where('Timestamp > ?', serverTime);
    processQuery(STATUS_TABLE, query, processStatusResponse);
    return true;
}


module.exports = async function (context, timer) {
    var timeStamp = new Date().toISOString();
    if (timer.ScheduleStatus.Last) {
        processPlantTelemetry(new Date(Date.parse(timer.ScheduleStatus.Last) - PERIOD));
        processWeatherTelemetry(new Date(Date.parse(timer.ScheduleStatus.Last) - PERIOD));
        processStatus(new Date(Date.parse(timer.ScheduleStatus.Last) - PERIOD));
    }
    if (timer.IsPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);
};