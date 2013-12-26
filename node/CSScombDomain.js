/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global exports, require */

(function () {
    "use strict";
    
    var spawn       = require("child_process").spawn,
        Comb        = require("csscomb"),
        CombConfig  = require("csscomb/config/csscomb.json"),
        DOMAIN      = "csscomb",
        RUN_COMMAND = "runCommand",
        comb        = new Comb();

    function runCommand(data, cb) {
        var cb_wtf = arguments[arguments.length - 1];
        //{ '0': data, '1': null, '2': [Function] }
        console.log('c', arguments);

        comb.configure(data.config || CombConfig);
        var combedCSS = comb.processString(data.css, data.ext);

        cb_wtf(null, combedCSS);
    }
    
    exports.init = function (DomainManager) {
        if (!DomainManager.hasDomain(DOMAIN)) {
            DomainManager.registerDomain(DOMAIN, {major: 0, minor: 1});
        }
        
        DomainManager.registerCommand(
            DOMAIN,
            RUN_COMMAND,
            runCommand,
            true,
            "Runs css through CSScomb cli-sorter."
        );
    };
}());