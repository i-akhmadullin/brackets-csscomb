/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global exports, require */

(function () {
    "use strict";
    
    var exec = require("child_process").exec;
//    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        
    var DOMAIN = "csscomb",
        RUN_COMMAND = "runCommand";
    
    function runCommand(txt, cb) {
//        var csscombPath = ExtensionUtils.getModulePath(module, "node/libs/call_string.php");
        var csscombPath = 'C:/Users/Ilya/AppData/Roaming/Brackets/extensions/user/brackets-csscomb/node/../csscomb/call_string.php';
        exec('php ' + csscombPath + ' "' + txt + '" ' + '_', function (error, stdout, stderr) {
            console.log('stdout', stdout);
//            return { sorted_css: stdout, original_css: txt };
        });
    }
    
    exports.init = function (DomainManager) {
        if (!DomainManager.hasDomain("csscomb")) {
            DomainManager.registerDomain("csscomb", {major: 0, minor: 1});
        }
        
        DomainManager.registerCommand(
            DOMAIN,
            RUN_COMMAND,
            runCommand,
            true,
            "Runs css through CSScomb cli-sorter.",
            [
                {
                    name: "command",
                    type: "string",
                    description: "css to sort"
                }
            ],
            [
                {
                    name: "sort_order",
                    type: "object",
                    description: "custom sort order"
                }
            ]
        );
    };
}());