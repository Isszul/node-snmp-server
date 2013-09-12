
var fs = require('fs');


function SnmpWalkParser(nosql) {
    Nosql = nosql;
};


SnmpWalkParser.prototype.processSnmpWalkFile = function (filename) {

    fs.readFile(filename, "utf8", function (err, fileAsString) {

        if (err) throw err;

        fileAsString.split("\r\n").map(function (line) {

            line = line.split(" = ");

            key = line[0];

            value = line[1].split(": ");
            dataType = value[0];
            dataValue = value[1];


            Nosql.insert({ 'key': key, 'dataType': dataType, 'dataValue': dataValue });


        });

    });

};




exports.load = exports.open = exports.SnmpWalkParser = exports.init = function(nosql) {
	return new SnmpWalkParser(nosql);
};
