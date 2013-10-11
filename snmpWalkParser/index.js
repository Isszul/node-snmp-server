
var fs = require('fs');
var events = require('events');
var util = require('../util');
var asn1ber = require('../lib/asn1ber.js');

function SnmpWalkFileProcessor() {
    
}

var linesToRead;
var linesRead;

var handleFileRead = function (err, fileAsString) {

    if (err) throw err;

    var fileLines = fileAsString.split("\r\n")
    linesToRead = fileLines.length;

    fileLines.map(function (line) {

        line = line.split(" = ");

        oidString = util.convertStringToOID(line[0]);

        if (line[1] != null) {
            value = line[1].split(": ");
            dataTypeString = util.convertDataType(value[0]);
            dataValueString = util.getParsedValueFromTypeAndValue(dataTypeString, value[1]);

            Nosql.insert({ oid: oidString, dataType: dataTypeString, dataValue: dataValueString });
            linesRead++;
        }

    });

};


SnmpWalkFileProcessor.prototype = new events.EventEmitter();


SnmpWalkFileProcessor.prototype.processSnmpWalkFile = function (filename, nosql) {

    self = this;

    Nosql = nosql;

    Nosql.on('insert', function () {
        if (Nosql.pendingWrite.length == 0 && linesRead == linesToRead) {
            self.emit('fileprocessed');
        }
    });

    linesRead = 0;
    fs.readFile(filename, "utf8", handleFileRead);



};





exports.init = function () {

    return new SnmpWalkFileProcessor();

};