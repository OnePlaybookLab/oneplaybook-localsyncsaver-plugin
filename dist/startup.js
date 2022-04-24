/*\
title: $:/plugins/oneplaybooklab/local-syncsaver-plugin/startup.js
type: application/javascript
module-type: startup

Removes deleted titles from static html wiki file if any

\*/

(function () {
    if (!$tw.browser) return;
    const url = new URL(window.location.href);
    const serializedHref = url.href.replaceAll("/", "_");
    const wikiParamsName = url.searchParams.get('wiki');
    const DATABASE = window.name || wikiParamsName || serializedHref;
    const db = new PouchDB(DATABASE);

    exports.name = 'oneplaybook-setup-tiddlers';
    exports.after = ["startup", "plugins"];
    exports.before = ["render", "story"];
    exports.platforms = ["browser"];
    exports.synchronous = false;
    exports.startup = async function (callback) {
        // remove titles designated for deletion in last session
        const tiddlerTitles = $tw.wiki.allTitles();
        db.allDocs({
            keys: tiddlerTitles
        }).then(function (result) {
            result.rows.forEach(function (item) {
                if (item.error) return;
                else if (item.value.deleted) {
                    $tw.wiki.deleteTiddler(item.key);
                }
        });
        }).then(function () {
            return callback();
        }).catch(function (err) { 
            return callback(err) 
        });
    };

})();