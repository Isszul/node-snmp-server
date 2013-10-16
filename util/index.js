
var asn1ber = require('../lib/asn1ber.js');

var snmpWalkToAsn1BerType = {
    "INTEGER": "Integer",
    "STRING": "OctetString",
    "Hex-STRING": "OctetString",
    "": "Null",
    "OID": "ObjectIdentifier",
    "Counter32" : "Counter",
    "Gauge32": "Gauge"
};


var convertOIDToString = function(oid) {
    var output = ".";
    for (var i=0; i<oid.length; i++) {
        output = output + oid[i];
        if (i<oid.length-1) {
            output = output + ".";
        }
    }
    return output;
};

exports.convertOIDToString = convertOIDToString;


var convertStringToOID = function(oid) {
    if (typeof oid !== 'string') {
        return oid;
    }

    if (oid[0] !== '.' && oid[0] == '1') {
        oid = '.' + oid;
    }

    oid = oid.split('.')
        .filter(function (s) {
            return s.length > 0;
        })
        .map(function (s) {
            return parseInt(s, 10);
        });

    return oid;
};

exports.convertStringToOID = convertStringToOID;


var convertDataType = function(dataType) {

    var type = snmpWalkToAsn1BerType[dataType];
    if (dataType === null || snmpWalkToAsn1BerType[dataType] === null){
        type = asn1ber.types.Null;
    }
    else {
        type = asn1ber.types[snmpWalkToAsn1BerType[dataType]] ;
    }
    return type;         
};

exports.convertDataType = convertDataType;


var getParsedValueFromTypeAndValue = function (type, value) {

    var returnValue;

    if (type === asn1ber.types.ObjectIdentifier) {
        // Object identifier type.
        returnValue = convertStringToOID(value);

    } else {
        returnValue = value;
    }


    return returnValue;
};

exports.getParsedValueFromTypeAndValue = getParsedValueFromTypeAndValue;