// https://github.com/ashtuchkin/u2f/blob/2e45ea40acd8c3ad6c113cd1b4e0558acc4cda3a/index.js#L62
const asnLen = (buf) => {
    if (buf.length < 2 || buf[0] != 0x30)
        throw new Error("Invalid data: Not a SEQUENCE ASN/DER structure");

    var len = buf[1];
    if (len & 0x80) { // long form
        var bytesCnt = len & 0x7F;
        if (buf.length < 2+bytesCnt)
            throw new Error("Invalid data: ASN structure not fully represented");
        len = 0;
        for (var i = 0; i < bytesCnt; i++)
            len = len*0x100 + buf[2+i];
        len += bytesCnt; // add bytes for length itself.
    }
    return len + 2; // add 2 initial bytes: type and length.
}

export default asnLen
