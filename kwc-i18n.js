(function () {
  "use strict"

  var parameterLength = 10

  var properties = {
    key: {
      type: String,
      value: null
    },
    var: {
      type: String,
      value: "",
      reflectToAttribute: true,
      notify: true
    },
    show: {
      type: Boolean,
      value: false
    }
  }

  for (var i = 0; i < parameterLength; i++) {
    properties["p" + i] = {
      type: String,
      value: null,
      observer: "_reloadPartial"
    }
  }

  Polymer({
    is: 'kwc-i18n',

    properties: properties,

    attached() {
      this._reloadFull()

      var that = this
      window.kwc_i18n.addListener(function () {
        that._reloadFull()
      })
    },

    _reloadFull() {
      this._result = window.kwc_i18n.get(this.key)
      this._reloadPartial()
    },

    _reloadPartial() {
      if (this._result) {
        var that = this
        this._result.then(function (value) {
          var result = value ? value : ""
          for (var i = 0, c = parameterLength; i < c; i++) {
            if (that["p" + i]) {
              result = result.replace("{" + i + "}", that["p" + i])
            }
          }
          that.var = result
        })
      }
    }
  })
})()