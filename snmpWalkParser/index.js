
var fs = require('fs');
var events = require('events');


function SnmpWalkFileProcessor() {
    
}

SnmpWalkFileProcessor.prototype = new events.EventEmitter();

SnmpWalkFileProcessor.prototype.processSnmpWalkFile = function (filename, nosql) {

    var self = this

    fs.readFile(filename, "utf8", function (err, fileAsString) {

        if (err) throw err;

        fileAsString.split("\r\n").map(function (line) {

            line = line.split(" = ");

            oidString = line[0];

            value = line[1].split(": ");

            dataTypeString = value[0];
            dataValueString = value[1];


            nosql.insert({ oid: oidString, dataType: dataTypeString, dataValue: dataValueString });

        });

        nosql.on('insert', function () {
            if (nosql.pendingWrite.length == 0) {
                self.emit('fileprocessed');
            }
        });

    });

};



exports.init = function () {

    return new SnmpWalkFileProcessor();

};