
var fs = require('fs');
var events = require('events');
var util = require('../util');
var asn1ber = require('../lib/asn1ber.js');

function SnmpWalkFileProcessor() {
    
}


var handleFileRead = function (err, fileAsString) {

    if (err) throw err;

    fileAsString.split("\r\n").map(function (line) {

        line = line.split(" = ");

        oidString = util.convertStringToOID(line[0]);

        if (line[1] != null) {
            value = line[1].split(": ");
            dataTypeString = util.convertDataType(value[0]);
            dataValueString = util.getParsedValueFromTypeAndValue(dataTypeString, value[1]);

            Nosql.insert({ oid: oidString, dataType: dataTypeString, dataValue: dataValueString });
        }

    });

};


SnmpWalkFileProcessor.prototype = new events.EventEmitter();


SnmpWalkFileProcessor.prototype.processSnmpWalkFile = function (filename, nosql) {

    self = this;

    Nosql = nosql;

    Nosql.on('insert', function () {
        if (Nosql.pendingWrite.length == 0) {
            self.emit('fileprocessed');
        }
    });

    fs.readFile(filename, "utf8", handleFileRead);



};





exports.init = function () {

    return new SnmpWalkFileProcessor();

};