/*\
title: $:/plugins/oneplaybooklab/dropboxsaver/DropboxSyncSetup.js
type: application/javascript
module-type: startup

Extracts essential system tiddlers from backend and adds them on startup

\*/

(function () {
    if (!$tw.browser) return;
    
    const PouchDB = require('pouchdb').default;
    const dropboxDB = new PouchDB('opb-dropbox-database');
    const STORY_LIST = '$:/StoryList';

    exports.name = 'dropbox-sync-setup';
    exports.before = ["story"];
    exports.synchronous = true;
    exports.startup = function () {
        return;
    };

})();