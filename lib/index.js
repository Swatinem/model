
try {
	var Emitter = require('emitter');
} catch (e) {
	Emitter = require('emitter-component');
}

module.exports = createModel;

function createModel(properties) {
	function Model(data) {
		if (!(this instanceof Model)) return new Model(data);
		Emitter.call(this);
		this._data = {};
		data = data || {};
		this._model.emit('construct', this, data);
		for (var prop in data) {
			if (!(prop in Model._skip))
				this[prop] = data[prop];
		}
	}

	Emitter(Model);

	Model._skip = {};
	Model._attrs = {};
	Model.attr = attr;
	Model.use = use;

	Model.prototype = Object.create(Emitter.prototype);
	Model.prototype._model = Model;
	Model.prototype._get = get;
	Model.prototype._set = set;
	Model.prototype.toJSON = toJSON;

	properties = properties || [];
	if (Array.isArray(properties)) {
		for (var i = 0; i < properties.length; i++) {
			var prop = properties[i];
			Model.attr(prop);
		}
	} else {
		var keys = Object.keys(properties);
		for (var i = 0; i < keys.length; i++) {
			var prop = keys[i];
			Model.attr(prop, properties[prop]);
		}
	}

	return Model;
}

function use(fns) {
	var self = this;
	fns = Array.isArray(fns) ? fns : [fns];
	for (var i = 0; i < fns.length; i++) {
		var fn = fns[i];
		fn(this);
	}
	return this;
}

function attr(name, metadata) {
	this._attrs[name] = metadata || {};

	Object.defineProperty(this.prototype, name, {
		enumerable: true,
		configurable: true,
		get: function () { return this._get(name); },
		set: function (val) { this._set(name, val); }
	});

	return this;
}

function get(name) {
	return this._data[name];
}
function set(name, val) {
	var prev = this._data[name];
	this._data[name] = val;
	this._model.emit('change', this, name, val, prev);
	this._model.emit('change ' + name, this, val, prev);
	this.emit('change', name, val, prev);
	this.emit('change ' + name, val, prev);
}
// FIXME: this might be fragile?
var ignore = {
	_data: true,
	_callbacks: true // emitter
};
function toJSON() {
	var json = {};
	var keys = Object.keys(this);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		if (!(key in ignore))
			json[key] = this[key];
	}
	for (var k in this._data)
		json[k] = this._data[k];
	return json;
}
