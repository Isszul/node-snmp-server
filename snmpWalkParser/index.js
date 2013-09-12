
var fs = require('fs');


processSnmpWalkFile = function (filename, nosql, callback) {

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
                callback();
            }
        });


    });


};




exports.processSnmpWalkFile = processSnmpWalkFile;