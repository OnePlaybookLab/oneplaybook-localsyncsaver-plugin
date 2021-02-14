/*\
title: $:/plugins/oneplaybooklab/dropboxsaver/DropboxSyncAdaptor.js
type: application/javascript
module-type: syncadaptor

\*/

(function () {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    if (!$tw.browser) return;

    const PouchDB = require('pouchdb').default;
    const dropboxDB = new PouchDB('opb-dropbox-database');

    function DropboxSyncAdaptor(options) {
        this.wiki = options.wiki;
    }

    DropboxSyncAdaptor.prototype.getTiddlerInfo = function (tiddler) {
        return {};
    };

    // DropboxSyncAdaptor.prototype.displayLoginPrompt = function (syncer) {};

    // DropboxSyncAdaptor.prototype.getStatus = function () {};

    // DropboxSyncAdaptor.prototype.login = function () {};

    // DropboxSyncAdaptor.prototype.logout = function () {};

    // DropboxSyncAdaptor.prototype.getUpdatedTiddlers = function (syncer, callback) {};

    DropboxSyncAdaptor.prototype.getSkinnyTiddlers = function (callback) {
        return dropboxDB.allDocs({
            include_docs: true
        }).then(function (result) {
            const tiddlers = [];
            result.rows.forEach(function (item) {
                tiddlers.push(item.doc.tiddler.fields)
            });
            callback(null, tiddlers);
        }).catch(function (err) {
            callback(err);
        });
    };

    DropboxSyncAdaptor.prototype.saveTiddler = function (tiddler, callback, tiddlerInfo) {
        return dropboxDB.get(tiddler.fields.title).then(function (doc) {
            // update tiddler document
            dropboxDB.put({
                _id: tiddler.fields.title,
                _rev: doc._rev,
                tiddler: tiddler
            }).then(function () {
                callback(null);
            }).catch(function (err) {
                callback(err);
            })
        }).catch(function (err) {
            // put new tiddler document if none exists in store
            if (err.status === 404) {
                dropboxDB.put({
                    _id: tiddler.fields.title,
                    tiddler: tiddler
                }).then(function () {
                    callback(null);
                }).catch(function (err) {
                    callback(err);
                });
            } else {
                callback(err);
            }
        })
    };

    DropboxSyncAdaptor.prototype.loadTiddler = function (title, callback) {
        return dropboxDB.get(title)
            .then(function (doc) {
                callback(null, doc.tiddler.fields);
            }).catch(function (err) {
                callback(err);
            });
    };

    DropboxSyncAdaptor.prototype.deleteTiddler = function (title, callback, options) {
        return dropboxDB.get(title)
            .then(function (doc) {
                dropboxDB.remove(doc)
                    .then(function () { callback(null) })
                    .catch(function (err) { callback(err) });
            }).catch(function (err) { callback(err) });
    };

    exports.adaptorClass = DropboxSyncAdaptor;

})();