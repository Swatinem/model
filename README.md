# Model

transparent ES5 models

[![Build Status](https://travis-ci.org/Swatinem/model.png?branch=master)](https://travis-ci.org/Swatinem/model)
[![Coverage Status](https://coveralls.io/repos/Swatinem/model/badge.png?branch=master)](https://coveralls.io/r/Swatinem/model)
[![Dependency Status](https://gemnasium.com/Swatinem/model.png)](https://gemnasium.com/Swatinem/model)

## Installation

    $ component install Swatinem/model

## Motivation

There are shitloads of Model components already, like
[component/model](https://github.com/component/model) or
[modella/modella](https://github.com/modella/modella),
but I’m unsatisfied with both of them. They come with shitloads of dependencies,
hell, `component/model` even has complete RESTful `save()` support.

This is just the bare minimum of property binding and extensibility.
You get `change (prop, value, old)` and `change prop (value, old)` events, just
like with `component/model`.
But the instances are completely transparent, thanks to ES5 accessor properties,
so you can just write `instance.prop += 'foo'` or whatever you like.
It just works. See [Compatibility](#compatibility) though.

## Model(properties)

Defines a new Model with a the gives properties.
`properties` can also be `key -> value` pairs, where the value is saved as
metadata in `model._attrs`

## .on('construct') -> (instance, data)

Hook into this if you want to create new instance private properties.

## .use(extension) .use([extensions]) -> (model)

Use one or more extensions that get called with the `model`.

You can create new methods on the Model to facilitate things like validation.

Or create new methods on the prototype to implement things like `.save()`.

Monkeypatch the `.prototype._set` method to implement things like dirty tracking.

Check the tests for some examples.

## .attr(name, metadata)

Defines a new property with optional metadata. Using the constructor is faster
however.

## Usage

```js
var Model = require('model');

var User = new Model(['name', 'email']);

var instance = new User({name: 'Foo', email: 'foo@foo.bar'});

instance.on('change name', function (value, old) {});

instance.name = 'Foobar';
instance.name; // => 'Foobar'
```

## Compatibility

This depends on ES5 support for accessor properties with getters and setters,
so this is IE >= 9, FF >= 4.
It’s 2013 damnit! You backwards compat nazis should just grow up and enjoy all
the nice features modern JS has to offer :-)

## License

  LGPLv3

