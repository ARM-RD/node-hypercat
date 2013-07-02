
exports.nsp_base_address = function(options) {
  return options.protocol + '://' + options.address + ':' + options.port + '/';
}

exports.merge_options = function(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}