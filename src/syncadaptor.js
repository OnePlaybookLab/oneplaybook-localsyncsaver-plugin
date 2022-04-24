/*\
title: $:/plugins/oneplaybooklab/local-syncsaver-plugin/syncadaptor.js
type: application/javascript
module-type: syncadaptor

\*/

(function () {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";
    if (!$tw.browser) return;
    const url = new URL(window.location.href);
    const serializedHref = url.href.replaceAll("/", "_");
    const wikiParamsName = url.searchParams.get('wiki');
    const DATABASE = window.name || wikiParamsName || serializedHref;
    const db = new PouchDB(DATABASE);
    const serializedRegex = /(\:)|(\/)/g;
    const deserializedRegex = /(\__)|(\_)/g;
    const serialize = string => string.replaceAll(serializedRegex, "_");
    const deserialize = string => string.replace(deserializedRegex, match => {
        if (match === "__") return ":/";
        return "/";
    });

    function OneplaybookSyncAdaptor(options) {
        this.wiki = options.wiki;
    }

    OneplaybookSyncAdaptor.prototype.getTiddlerInfo = function (tiddler) {
        return {};
    };

    OneplaybookSyncAdaptor.prototype.saveTiddler = function (tiddler, callback, tiddlerInfo) {
        return db.get(tiddler.fields.title).then(function (doc) {
            // update tiddler document
            db.put({
                _id: tiddler.fields.title,
                _rev: doc._rev,
                tiddler: { fields: {
                    ...tiddler.fields,
                    ...{ title: serialize(tiddler.fields.title) }
                } }
            }).then(function () {
                callback(null);
            }).catch(function (err) {
                callback(err);
            })
        }).catch(function (err) {
            // put new tiddler document if none exists in store
            if (err.status === 404) {
                db.put({
                    _id: tiddler.fields.title,
                    tiddler: { fields: {
                        ...tiddler.fields,
                        ...{ title: serialize(tiddler.fields.title) }
                    } }
                }).then(function () {
                    callback(null);
                }).catch(function (err) {
                    callback(err);
                });
            } else {
                callback(err);
            }
        });
    };

    OneplaybookSyncAdaptor.prototype.loadTiddler = function (title, callback) {
        // fetch local or default to server if not present
            return db.get(title)
            .then(function (doc) {
                callback(null, { ...doc.tiddler.fields, ...{ title: deserialize(doc.tiddler.fields.title) } }); 
            }).catch(function (err) {
                callback(err);
            });
    };

    OneplaybookSyncAdaptor.prototype.deleteTiddler = function (title, callback, options) {
        // delete local then at server
        return db.allDocs({
                keys: [title],
                include_docs: true
            }).then(function (result) {
                /* Removes tiddlers written to database
                *  as well as recording as deleted tiddlers
                *  not yet written to the database
                */
                result.rows.forEach(function (item) {
                    if (item.error) {
                        db.put({
                            _id: title,
                            _deleted: true
                        }).then(function () {
                            callback(null);
                        }).catch(function (err) { callback(err) });
                    } else if (item.doc) {
                        item.doc._deleted = true;
                        db.put(item.doc).then(function () {
                            callback(null);
                        }).catch(function (err) { callback(err) });
                    } else callback(null);
                });
            }).catch(function (err) { 
                callback(err);
             });
    };

    exports.adaptorClass = OneplaybookSyncAdaptor;

})();