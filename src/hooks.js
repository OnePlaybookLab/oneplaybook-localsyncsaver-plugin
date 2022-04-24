/*\
title: $:/plugins/oneplaybooklab/local-syncsaver-plugin/hooks.js
type: application/javascript
module-type: startup

Enables key hooks for Local syncsaver plugin

\*/

(function () {
    if (!$tw.browser) return;

    exports.name = 'oneplaybook-setup-hooks';
    exports.after = ["startup"];
    exports.platforms = ["browser"];
    exports.synchronous = true;
    exports.startup = function () {
        const wiki = $tw.wiki.getTiddlerText("$:/LocalSyncsaverDatabaseName");
        // stamp all created tiddlers with owning wiki name
        $tw.hooks.addHook("th-saving-tiddler", function (tiddler) {
            return new $tw.Tiddler(tiddler,{ wiki });
        });
    };

})();