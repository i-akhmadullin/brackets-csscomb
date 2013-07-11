/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    var CommandManager  = brackets.getModule("command/CommandManager"),
        Menus           = brackets.getModule("command/Menus"),

        EditorManager   = brackets.getModule("editor/EditorManager"),
        Editor          = brackets.getModule("editor/Editor").Editor,

        AppInit         = brackets.getModule("utils/AppInit"),
        NodeConnection  = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        
        DocumentManager = brackets.getModule("document/DocumentManager"),
        COMMAND_ID = "csscomb.csscomb",
        
        nodeConnection,
        sortedCSS,
        start,
        end,
        isSelection = false;

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
            console.error("failed to connect to node");
        });
        return connectionPromise;
    }

    // Helper function that loads our domain into the node server
    function loadDomain() {
        var path        = ExtensionUtils.getModulePath(module, "node/CSScombDomain"),
            loadPromise = nodeConnection.loadDomains([path], true);
        loadPromise.fail(function () {
            console.log("failed to load domain");
        });
        loadPromise.done(function () {
            console.log("csscomb domain successfully loaded");
        });
        return loadPromise;
    }

    function replaceCSS(css) {
        var editor = EditorManager.getCurrentFullEditor(),
            doc    = DocumentManager.getCurrentDocument(),
            cursor = editor.getCursorPos(),
            scroll = editor.getScrollPos();

        doc.batchOperation(function () {
            if (isSelection) {
                doc.replaceRange(css, start, end);
            } else {
                doc.setText(css);
            }
            editor.setCursorPos(cursor);
            editor.setScrollPos(scroll.x, scroll.y);
        });
        console.log('csscomb replace finished');
    }
    
    function sortCSS(cssToSort) {
        var path        = ExtensionUtils.getModulePath(module, "csscomb/call_string.php"),
            order       = '_',
            sortPromise = nodeConnection.domains.csscomb.runCommand(path, cssToSort, order, function (css) {
                sortPromise.resolve(css);
            });

        sortPromise.fail(function (err) {
            console.error("failed to run csscomb domain", err);
        });
        sortPromise.done(function (css) {
            console.log("csscomb domain work is done", css);
            replaceCSS(css);
        });
        return sortPromise;
    }

    AppInit.appReady(function () {
        nodeConnection = new NodeConnection();

        chain(connect, loadDomain);
    });
    
    function csscombSort() {
        var editor       = EditorManager.getCurrentFullEditor(),
            selectedText = editor.getSelectedText(),
            selection    = editor.getSelection(),
            cssToSort;

        start = selection.start;
        end = selection.end;

        if (selectedText.length > 0) {
            isSelection = true;
            cssToSort = selectedText;
        } else {
            cssToSort = DocumentManager.getCurrentDocument().getText();
        }
        
        sortCSS(cssToSort);
    }

    CommandManager.register("Sort with CSScomb", COMMAND_ID, csscombSort);
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
