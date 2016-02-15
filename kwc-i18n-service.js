(function () {
  "use strict"

  // We register the service once to avoid multiple instances accross <kwc-i18n> imports and uselessly increase memory.
  if (!window.kwc_i18n) {
    /**
     * This object is used to load and save the configuration in session or local storage (choice of developer).
     * This object is not responsible of the configuration structure.
     * @private
     */
    var configurationStorage = {
      /**
       * The used storage (sessionStorage or localStorage)
       * @private
       */
      storage: null,
      
      /**
       * The configuration key
       * @private
       */
      key: null,
      
      /**
       * Set up the configuration storage.
       * 
       * @param {String} confLocation: The location of the storage (ex: localStorage[my-app-i18n-storage], sessionStorage[mykey])
       * @return {this}
       * @public
       */
      setup: function (confLocation) {
        if (confLocation) {
          var storageRegex = new RegExp("(localStorage|sessionStorage)\\[(.+)\\]")
          if (storageRegex.test(confLocation)) {
            var data = storageRegex.exec(confLocation)
            this.storage = data[1] === "localStorage" ? localStorage : sessionStorage
            this.key = data[2]
          } else {
            this.storage = this.key = null
          }
        } else {
          this.storage = this.key = null
        }
        return this
      },
      
      /**
       * Loads the configuration.
       * @public
       */
      get: function () {
        if (this.storage && this.key) {
          var result = this.storage[this.key]
          if (result) {
            return JSON.parse(result)
          } else {
            return null
          }
        } else {
          return null
        }
      },
      
      /**
       * Saves the configuration
       * 
       * @param {Object} conf: The configuration object
       * @return {this}
       * @public
       */
      set: function (conf) {
        if (this.storage && this.key) {
          this.storage[this.key] = JSON.stringify(conf)
        }
        return this
      }
    }

    /**
     * This service is used by the <kwc-i18n> component to fetch and return translations.
     * @protected
     */
    window.kwc_i18n = {
      /**
       * Listeners triggered when configuration changed.
       * The <kwc-i18n> component could be updated after a configuration change.
       * @private
       */
      _listeners: [],
      
      /**
       * @see Object.defineProperty(kwc_i18n, "source"
       * @private
       */
      _source: null,
      
      /**
       * @see Object.defineProperty(kwc_i18n, "locale"
       * @private
       */
      _locale: null,
      
      /**
       * This promise will be the asynchronous container of the translation messages.
       * @private
       */
      _promise: null,
      
      /**
       * This properties is used to check if there is a need to reload the messages.
       * It is relevant when you do not want the messages be reloaded each time the user refreshes or changes the page.
       * @private
       */
      _date: null,
      
      /**
       * Flags indicating the service is initialized.
       * @private
       */
      _initialized: false,

      /**
       * Set up the service.
       * 
       * @param {Object}   options: Options of the service including
       * - {String}  source:  The source of messages, "{locale}" will be transformed as the selected localeuage (ex: "/i18n/{locale}.json")
       * - {String}  locale:  The locale to use by default - could be ignored if `save` is set and a configuration was saved (user preference, for instance)
       * - {String}  [save]:  If set, configuration and cache will be saved in sessionStorage or localStorage at given key (ex: "localStorage[my.key]", "sessionStorage[mykey]")
       *                      If a configuration was saved, ignore given source and locale, except if `force` = true
       * - {boolean} [force]: If true, ignore saved configuration and use given one (reload translations too)
       * - {Date}    [date]:  The date of last translation change, if null, always reload translations
       * @return {this}
       * @public
       */
      setup: function (options) {
        var that = this
        function processOnSetup() {
          that.source = options.source
          that.locale = options.locale
          that._saveConf()
        }

        configurationStorage.setup(options ? options.save : null)
        if (options && options.force) {
          // always call onSetup
          processOnSetup()
        } else {
          var conf = configurationStorage.get()
          if (conf) {
            this._locale = conf.locale
            this._source = conf.source
            if (options && options.date && (!conf.date || conf.date < options.date.getTime() || !conf.cache)) {
              this._promise = null
            } else {
              this._promise = Promise.resolve(conf.cache)
            }
          } else {
            processOnSetup()
          }
        }
        that._initialized = true
        return this
      },

      /**
       * Adds a listener which will be triggered each time the configuration change (and so the translation).
       * 
       * @param {function} listener: The listener to add
       * @return {this}
       */
      addListener: function (listener) {
        this._listeners.push(listener)
        return this
      },

      /**
       * Gets the translation for given key.
       * The result is a promise containing the translation as value
       * 
       * @param {String} key: The key of translation
       * @return {Promise}:   The translation for given key
       */
      get: function (key) {
        if (!this._promise) {
          this._reload()
        }
        return this._promise.then(function (translate) {
          try {
            var result = translate
            var parts = key.split(".")
            for (var i = 0, c = parts.length; i < c; i++) {
              result = result[parts[i]]
            }
            return result
          } catch (e) {
            return null
          }
        })
      },

      /**
       * Saves the configuration into session storage or local storage is set up.
       * 
       * @return {this}
       */
      _saveConf: function () {
        if (this._promise == null) {
          configurationStorage.set({
            locale: this._locale,
            source: this._source,
            cache: null,
            date: this._date ? this._date.getTime() : null
          })
        } else {
          var that = this
          this._promise.then(function (cache) {
            configurationStorage.set({
              locale: that._locale,
              source: that._source,
              cache: cache,
              date: that._date ? that._date.getTime() : null
            })
          })
        }
        return this
      },

      /**
       * Reloads all translations.
       * 
       * @return {this}
       */
      _reload: function () {
        // Only when all configuration is set.
        if (this.source && this.locale && this._initialized) {
          var that = this
          that._date = new Date()
          this._promise = new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest()
            var url = that.source.replace("{locale}", that.locale)
            req.open("GET", url, true)
            req.onreadystatechange = function () {
              if (req.readyState == 4 && req.status == 200) {
                resolve(JSON.parse(req.responseText))
              }
            }
            req.send(null)
          })
          this._saveConf()
          this._fireListeners()
        }
        return this
      },

      /**
       * Fires all listeners.
       * 
       * @return {this}
       */
      _fireListeners: function () {
        this._listeners.forEach(function (listener) {
          listener()
        }, this);
        return this
      }
    }

    /**
     * The source url to get translation messages, "{locale}" will be transformed as the selected localeuage.
     * examples of `source`: "/i18n/{locale}.json" => "/i18n/en.json", "/i18n/fr.json"
     */
    Object.defineProperty(window.kwc_i18n, "source", {
      get: function () { return this._source },
      set: function (source) {
        this._source = source
        this._reload()
      }
    })

    /**
     * The locale used to translate messages.
     */
    Object.defineProperty(window.kwc_i18n, "locale", {
      get: function () { return this._locale },
      set: function (locale) {
        this._locale = locale
        this._reload()
      }
    })
  }
})()