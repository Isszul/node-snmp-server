var SNMP_STRUCTURE_SIZE_IN_BYTES = {
    
    "SNMP_MESSAGE_TYPE" : 1,
    "SNMP_MESSAGE_LENGTH" : 1,

    "SNMP_VERSION_TYPE" : 1,
    "SNMP_VERSION_LENGTH" :  1,
    "SNMP_VERSION_VALUE" : "SNMP_VERSION_LENGTH",

    "SNMP_COMMUNITY_STRING_TYPE" : 1,
    "SNMP_COMMUNITY_STRING_LENGTH" : 1,
    "SNMP_COMMUNITY_STRING_VALUE" : "SNMP_COMMUNITY_STRING_LENGTH",

    "SNMP_PDU_TYPE" : 1,
    "SNMP_PDU_LENGTH" : 1,

    "REQUEST_ID_TYPE": 1,
    "REQUEST_ID_LENGTH": 1,
    "REQUEST_ID_VALUE": "REQUEST_ID_LENGTH",

    "ERROR_TYPE": 1,
    "ERROR_LENGTH": 1,
    "ERROR_VALUE": "ERROR_LENGTH",

    "ERROR_INDEX_TYPE": 1,
    "ERROR_INDEX_LENGTH": 1,
    "ERROR_INDEX_VALUE": "ERROR_INDEX_LENGTH",

    "VARBIND_LIST_TYPE": 1,
    "VARBIND_LIST_LENGTH": 1,

    "VARBIND_TYPE": 1,
    "VARBIND_LENGTH": 1,

    "OBJECT_IDENTIFIER_TYPE": 1,
    "OBJECT_IDENTIFIER_LENGTH": 1,
    "OBJECT_IDENTIFIER_VALUE": "OBJECT_IDENTIFIER_LENGTH",

    "VALUE_TYPE": 1,
    "VALUE_LENGTH": 1,
    "VALUE_VALUE" : "VALUE_LENGTH"

};

function isInt(n) {
   return n % 1 === 0;
}


GetOidFromPacket = function (msg) {

    var formattedPacket = {};

    var currentPosition = 0;

    for (key in SNMP_STRUCTURE_SIZE_IN_BYTES) {

        console.log(currentPosition, key, SNMP_STRUCTURE_SIZE_IN_BYTES[key], isInt(SNMP_STRUCTURE_SIZE_IN_BYTES[key]), formattedPacket);
        console.log("===============================");

        if (isInt(SNMP_STRUCTURE_SIZE_IN_BYTES[key])) {
            nextSliceSize = SNMP_STRUCTURE_SIZE_IN_BYTES[key];
        }
        else {
            nextSliceSize = formattedPacket[SNMP_STRUCTURE_SIZE_IN_BYTES[key]];
        }

        if (key.indexOf("_LENGTH") > -1) {
            formattedPacket[key] = msg.readUInt8(currentPosition);
        } else {
            formattedPacket[key] = msg.slice(currentPosition, currentPosition + nextSliceSize);
        }

        currentPosition += nextSliceSize;
    }

    console.log(formattedPacket);

}


exports.GetOidFromPacket = GetOidFromPacket;
