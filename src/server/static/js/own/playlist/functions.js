function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function cleanForRegex(regexString) {

    if (typeof (regexString) === "string")
        return regexString.replace(/[\\^$*+?.()|[\]{}]/g, '');
}