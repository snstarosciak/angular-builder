describe('example-app.login', function() {

	var test;

	beforeEach(module('example-app.login'));
	beforeEach(inject(function(_test_) {
		//do some setup
		test = _test_;
	}));

	it('should equal 2', function() {
		expect(test).toBe(4);
	});
});