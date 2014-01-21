
var Model = require('../');
var should = require('should');

describe('Model', function () {
	it('should create a completely transparent object', function () {
		var SomeModel = Model().attr('prop');
		var obj = new SomeModel();
		obj.prop = 1;
		obj.prop.should.eql(1);
	});
	it('should save metadata for the properties', function () {
		var SomeModel = Model()
			.attr('prop', {some: 'metadata'});
		var obj = new SomeModel();
		obj._model._attrs.prop.should.eql({some: 'metadata'});
	});
	it('should reference the original model', function () {
		var SomeModel = Model().attr('prop');
		var obj = new SomeModel();
		obj._model.should.equal(SomeModel);
	});
	it('should fire events for changes', function (done) {
		var SomeModel = Model().attr('prop');
		var obj = new SomeModel();
		obj.once('change prop', function (val, old) {
			val.should.eql(1);
			should.not.exist(old);
			obj.once('change prop', function (val, old) {
				val.should.eql(2);
				old.should.eql(1);
				done();
			});
			obj.prop = 2;
		});
		obj.prop = 1;
	});
	it('should allow passing an array of properties', function () {
		var SomeModel = Model(['prop', 'prop2']);
		var obj = new SomeModel();
		var calls = 0;
		obj.once('change', function (name, val, old) {
			calls++;
			name.should.eql('prop');
			val.should.eql(1);
		});
		obj.prop = 1;
		obj.once('change', function (name, val, old) {
			calls++;
			name.should.eql('prop2');
			val.should.eql(2);
		});
		obj.prop2 = 2;
		calls.should.eql(2);
	});
	it('should allow passing an object of properties and metadata', function (done) {
		var SomeModel = Model({prop: {some: 'metadata'}});
		var obj = new SomeModel();
		obj.once('change', function (name, val, old) {
			name.should.eql('prop');
			val.should.eql(1);
			done();
		});
		obj.prop = 1;
	});
	it('should support JSON.stringify', function () {
		var SomeModel = Model(['prop', 'prop2']);
		var obj = new SomeModel();
		obj.prop = 1;
		JSON.parse(JSON.stringify(obj)).should.eql({prop: 1});
	});
	it('should preserve unbound properties on JSON.stringify', function () {
		var SomeModel = Model(['prop', 'prop2']);
		var obj = new SomeModel();
		obj.prop = 1;
		obj.unbound = 1;
		JSON.parse(JSON.stringify(obj)).should.eql({prop: 1, unbound: 1});
	});
	it('should emit a construct event', function (done) {
		var SomeModel = Model(['prop', 'prop2']);
		SomeModel.on('construct', function (instance) {
			instance.should.be.an.instanceof(SomeModel);
			done();
		});
		var obj = new SomeModel();
	});
	it('should delegate change events to the model', function (done) {
		var SomeModel = Model().attr('prop');
		var obj = new SomeModel();
		SomeModel.once('change prop', function (instance, val, old) {
			instance.should.eql(obj);
			val.should.eql(1);
			should.not.exist(old);
			SomeModel.once('change', function (instance, prop, val, old) {
				instance.should.eql(obj);
				prop.should.eql('prop');
				val.should.eql(2);
				old.should.eql(1);
				done();
			});
			obj.prop = 2;
		});
		obj.prop = 1;
	});
	it('should support constructing from a plain object', function (done) {
		var SomeModel = Model().attr('prop');
		SomeModel.once('change prop', function (instance, val, old) {
			instance.should.be.an.instanceof(SomeModel);
			val.should.eql(1);
			done();
		});
		var obj = new SomeModel({prop: 1});
	});
	describe('Extensibility', function () {
		it('should take an array of extensions', function () {
			var SomeModel = Model(['prop', 'prop2']);
			var calls = 0;
			var fn = function () { calls++; };
			SomeModel.use([fn, fn, fn]);
			calls.should.eql(3);
		});
		it('should support new instance methods', function (done) {
			var SomeModel = Model(['prop', 'prop2']);
			SomeModel.use(function (Model) {
				Model.prototype.save = function () {
					this._data.should.eql({prop: 1});
					done();
				}
			});
			var obj = new SomeModel();
			obj.prop = 1;
			obj.save();
		});
		it('should support new Model methods', function (done) {
			var SomeModel = Model(['prop', 'prop2']);
			SomeModel.use(function (Model) {
				Model.validate = function (prop) {
					prop.should.eql('prop');
					done();
				}
			});
			SomeModel.validate('prop');
		});
		it('should support monkeypatching _get and _set', function () {
			var SomeModel = Model(['prop', 'prop2']);
			var calls = 0;
			SomeModel.use(function (Model) {
				Model.on('construct', function (instance) {
					instance._dirty = {};
				});
				var set = Model.prototype._set;
				var get = Model.prototype._get;
				Model.prototype._set = function (name, val) {
					calls++;
					this._dirty[name] = val;
					name.should.eql('prop');
					set.call(this, name, val);
				}
				Model.prototype._get = function (name) {
					calls++;
					this._dirty.should.eql({prop: 1});
					return get.call(this, name);
				}
			});
			var obj = new SomeModel();
			obj.prop = 1;
			obj.prop.should.eql(1);
			calls.should.eql(2);
		});
		it('should always provide initial values', function (done) {
			var SomeModel = new Model();
			SomeModel.use(function (Model) {
				Model.on('construct', function (instance, initial) {
					should.exist(initial);
					initial.should.eql({});
					done();
				});
			});
			new SomeModel();
		});
		it('should allow skipping certain construct time variables', function () {
			var SomeModel = new Model(['skip', 'noskip']);
			SomeModel.use(function (Model) {
				Model._skip.skip = true;
			});
			var obj = new SomeModel({skip: 'foo', noskip: 'bar'});
			should.not.exist(obj.skip);
			obj.noskip.should.eql('bar');
		});
	});
});

