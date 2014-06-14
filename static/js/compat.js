if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

function two_digits(i) {
    return ("0" + i).slice(-2);
}

function dec2hex(i) {
    if (i <= 15) {
        return "0" + i.toString(16);
    }
    return i.toString(16);
}
