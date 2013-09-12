
var fs = require('fs');


processSnmpWalkFile = function (filename, nosql) {

    Nosql = nosql;

    fs.readFile(filename, "utf8", function (err, fileAsString) {

        if (err) throw err;

        fileAsString.split("\r\n").map(function (line) {

            line = line.split(" = ");

            oidString = line[0];

            value = line[1].split(": ");

            dataTypeString = value[0];
            dataValueString = value[1];


            Nosql.insert({ oid: oidString, dataType: dataTypeString, dataValue: dataValueString });

        });

    });

};




exports.processSnmpWalkFile = processSnmpWalkFile;