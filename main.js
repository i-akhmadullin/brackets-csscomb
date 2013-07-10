/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    var CommandManager  = brackets.getModule("command/CommandManager"),
        EditorManager   = brackets.getModule("editor/EditorManager"),

        AppInit         = brackets.getModule("utils/AppInit"),
        NodeConnection  = brackets.getModule("utils/NodeConnection"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),

        Editor          = brackets.getModule("editor/Editor").Editor,
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Menus           = brackets.getModule("command/Menus"),
        COMMAND_ID = "csscomb.csscomb";
    
    var settings = JSON.parse(require("text!settings.json"));
    var nodeConnection;
    var formattedText;

    // Helper function that chains a series of promise-returning
    // functions together via their done callbacks.
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                chain.apply(null, functions);
            });
        }
    }

    // Helper function to connect to node
    function connect() {
        var connectionPromise = nodeConnection.connect(true);
        connectionPromise.fail(function () {
            console.error("[brackets-simple-node] failed to connect to node");
        });
        return connectionPromise;
    }

    // Helper function that loads our domain into the node server
    function loadDomain() {
        var path = ExtensionUtils.getModulePath(module, "node/CSScombDomain");
        var loadPromise = nodeConnection.loadDomains([path], true);
        loadPromise.fail(function () {
            console.log("failed to load domain");
        });
        loadPromise.done(function () {
            console.log("csscomb domain successfully loaded");
        });
        return loadPromise;
    }

    function sortCSS(css) {
        var sortPromise = nodeConnection.domains.csscomb.runCommand(css);

        sortPromise.fail(function (err) {
            console.error("[brackets-simple-node] failed to run csscombManager.runCommand", err);
        });
        sortPromise.done(function (css) {
            console.log("csscomb sortpromise done", css);
            formattedText = css;
        });
        return sortPromise;
    }

    AppInit.appReady(function () {
        nodeConnection = new NodeConnection();

        chain(connect, loadDomain);
    });

    function format() {
        var editor = EditorManager.getCurrentFullEditor();
        var selectedText = editor.getSelectedText();

        var unformattedText, isSelection = false;
        var selection = editor.getSelection();

        if (selectedText.length > 0) {
            isSelection = true;
            unformattedText = selectedText;
        } else {
            unformattedText = DocumentManager.getCurrentDocument().getText();
        }
        
        var cursor = editor.getCursorPos();
        var scroll = editor.getScrollPos();

        var doc = DocumentManager.getCurrentDocument();
        var language = doc.getLanguage();
        var fileType = language._id;

//        switch (fileType) {

//        case 'css':
//        case 'less':
//            formattedText = _formatCSS(unformattedText);
//            break;

//        default:
//            alert('Could not determine file type');
//        formattedText = _formatCSS(unformattedText);
//            return;
//        }

        function replaceCSS() {
            doc.batchOperation(function () {
    
                if (isSelection) {
                    doc.replaceRange(formattedText, selection.start, selection.end);
                } else {
                    doc.setText(formattedText);
                }
    
                editor.setCursorPos(cursor);
                editor.setScrollPos(scroll.x, scroll.y);
            });
        }

        chain(sortCSS(unformattedText), replaceCSS(doc));
    }

    CommandManager.register("CSScomb", COMMAND_ID, format);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    var windowsCommand = {
        key: "Ctrl-Shift-C",
        platform: "win"
    };

    var macCommand = {
        key: "Cmd-Shift-C",
        platform: "mac"
    };

    var command = [windowsCommand, macCommand];
    menu.addMenuItem(COMMAND_ID, command);

});
