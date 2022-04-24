// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"JCoP":[function(require,module,exports) {
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  var url = new URL(window.location.href);
  var serializedHref = url.href.replaceAll("/", "_");
  var wikiParamsName = url.searchParams.get('wiki');
  var DATABASE = window.name || wikiParamsName || serializedHref;
  var db = new PouchDB(DATABASE);
  var serializedRegex = /(\:)|(\/)/g;
  var deserializedRegex = /(\__)|(\_)/g;

  var serialize = function serialize(string) {
    return string.replaceAll(serializedRegex, "_");
  };

  var deserialize = function deserialize(string) {
    return string.replace(deserializedRegex, function (match) {
      if (match === "__") return ":/";
      return "/";
    });
  };

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
        tiddler: {
          fields: _objectSpread(_objectSpread({}, tiddler.fields), {
            title: serialize(tiddler.fields.title)
          })
        }
      }).then(function () {
        callback(null);
      }).catch(function (err) {
        callback(err);
      });
    }).catch(function (err) {
      // put new tiddler document if none exists in store
      if (err.status === 404) {
        db.put({
          _id: tiddler.fields.title,
          tiddler: {
            fields: _objectSpread(_objectSpread({}, tiddler.fields), {
              title: serialize(tiddler.fields.title)
            })
          }
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
    return db.get(title).then(function (doc) {
      callback(null, _objectSpread(_objectSpread({}, doc.tiddler.fields), {
        title: deserialize(doc.tiddler.fields.title)
      }));
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
          }).catch(function (err) {
            callback(err);
          });
        } else if (item.doc) {
          item.doc._deleted = true;
          db.put(item.doc).then(function () {
            callback(null);
          }).catch(function (err) {
            callback(err);
          });
        } else callback(null);
      });
    }).catch(function (err) {
      callback(err);
    });
  };

  exports.adaptorClass = OneplaybookSyncAdaptor;
})();
},{}]},{},["JCoP"], null)