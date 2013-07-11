/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global exports, require */

(function () {
    "use strict";
    
    var spawn = require("child_process").spawn,
        DOMAIN = "csscomb",
        RUN_COMMAND = "runCommand";
    
    function runCommand(path, txt, order, cb) {
        var cb_wtf = arguments[arguments.length - 1];
        // console.log('cb_wtf', cb_wtf);
        console.log('c', arguments);

        var proc   = spawn('php', [path, txt, order]),
            output = '';

        proc.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            output += data;
        });
        
        proc.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        
        proc.on('close', function (code) {
            // console.log('output', output);
            console.log('child process exited with code ' + code);
            proc.stdin.end();
            cb_wtf(undefined, output);
        });
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
            "Runs css through CSScomb cli-sorter.",
            [
                {
                    name: "path",
                    type: "string",
                    description: "path to csscomb lib"
                }
            ],
            [
                {
                    name: "csstosort",
                    type: "string",
                    description: "css to sort"
                }
            ],
            [
                {
                    name: "order",
                    type: "string",
                    description: "custom sort order"
                }
            ],
            [
                {
                    name: "callback",
                    type: "object",
                    description: "cb to execute after sorting is over"
                }
            ]
        );
    };
}());