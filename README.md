# &lt;kwc-i18n&gt;

> A web component used to manage internationalization

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install kwc-i18n --save
```

Or [download as ZIP](https://github.com/successk/kwc-i18n/archive/master.zip).

## Usage

1 – Import polyfill:

```html
<script src="bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>
```

2 – Import custom element:

```html
<link rel="import" href="bower_components/kwc-i18n/kwc-i18n.html">
```

3 – Start using it!

```html
<kwc-i18n key="my.key" show></kwc-i18n>

<!-- You need to be inside a component to use var -->
<kwc-i18n key="my.key.invar" var="{{myvar}}"></kwc-i18n>
<input type="text" placeholder="[[myvar]]">
```

4 - On your index page, put the following code:

```html
<!-- Needs to import component here too. -->
<link rel="import" href="bower_components/kwc-i18n/kwc-i18n.html">
<!-- ... -->
<script>
  document.addEventListener('HTMLImportsLoaded', function() {
    window.kwc_i18n.setup({
      // Where find your message ({locale} will be replaced by locale value (eg: "en", "fr"))
      source: "messages/{locale}.json",
      // Which locale to use by default?
      locale: "en",
      // Save the configuration into localStorage with key "kwc-i18n", replace source and locale with saved values
      // useful when user locale can change and should not be reset each time the page load
      save: "localStorage[kwc-i18n]",
      // Date of the last translation changed (if null, always fetch translation)
      date: new Date(),
      // If true, ignore saved configuration and reset service
      force: true
    })
  })
  
  // change locale anywhere it will reload all translations
  window.kwc_i18n.locale = "fr"
</script>
```

## Options

Attribute       | Options              | Default      | Description
---             | ---                  | ---          | ---
`key`           | *String*             | `null`       | The message key, as you will call it in js (ex: "my.super.key")
`show`          | *boolean*            | `false`      | If set, show the message
`var`           | *{{variable}}*       | `null`       | If set, register the translation result into the variable

## Children

Selector   | Description
---        | ---
None       | -

## Methods

Method        | Parameters   | Returns     | Description
---           | ---          | ---         | ---
None          | -            | -           | -

## Events

Event     | Detail   | Description
---       | ---      | ---
None      | -        | -

## Styles

Name | Default | Description
---  | ---     | --
None | -       | -

## Development

In order to run it locally you'll need to fetch some dependencies and a basic server setup.

1 – Install [bower](http://bower.io/) & [polyserve](https://npmjs.com/polyserve):

```sh
$ npm install -g bower polyserve
```

2 – Install local dependencies:

```sh
$ bower install
```

3 – Start development server and open `http://localhost:8080/components/kwc-i18n/`.

```sh
$ polyserve
```

## History

For detailed changelog, check [Releases](https://github.com/successk/kwc-i18n/releases).

## License

MIT