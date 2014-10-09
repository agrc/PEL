require([
        'app/GeometryFromRoute',

        'dojo/dom-construct',

        'dojo/_base/window'
    ],

    function(
        WidgetUnderTest,

        domConstruct,

        win
    ) {
        describe('app/GeometryFromRoute', function() {
            var testWidget;
            beforeEach(function() {
                testWidget = new WidgetUnderTest({
                    url: 'http://localhost/arcgis/rest/services/PEL/MilepostSegment/GPServer/Milepost_Segment'
                }, domConstruct.create('div', {}, win.body()));
                testWidget.startup();
            });
            afterEach(function() {
                testWidget.destroy();
                testWidget = null;
            });

            it('creates a valid object', function() {
                expect(testWidget).toEqual(jasmine.any(WidgetUnderTest));
            });

            describe('route list', function() {
                it('builds the list ascending', function() {
                    // fist node is select a route option
                    expect(testWidget.routeNode.children[1].value).toEqual('0006P');
                    expect(testWidget.routeNode.children[250].value).toEqual('089AP');
                });
                it('builds the route select', function() {
                    // 250 routes plus 1 for the choose directions
                    expect(testWidget.routeNode.childElementCount).toEqual(251);
                });
            });

            describe('requests', function() {
                it('resets widget and displays message on fail', function() {
                    spyOn(testWidget, 'onFail');

                    testWidget.gpComplete({
                        jobInfo: {
                            'jobId': 'j3ceabe28199c4529b635cadfde999b68',
                            'jobStatus': 'esriJobFailed',
                            'messages': ['something went wrong']
                        }
                    });

                    expect(testWidget.onFail).toHaveBeenCalled();
                });
            });

            describe('validate', function() {
                beforeEach(function() {
                    testWidget.routeNode.value = '0080P';
                });

                it('is true when start milepost is before end milepost', function() {
                    testWidget.startNode.value = '5';
                    testWidget.endNode.value = '11';

                    testWidget.updateValues();

                    expect(testWidget.start).toBe(5);
                    expect(testWidget.end).toBe(11);
                    expect(testWidget.validate()).toBe(true);
                });

                it('is false when start milepost is before end milepost', function() {
                    testWidget.startNode.value = '11';
                    testWidget.endNode.value = '5';

                    testWidget.updateValues();

                    expect(testWidget.end).toBe(5);
                    expect(testWidget.start).toBe(11);
                    expect(testWidget.validate()).toBe(false);
                });
            });
        });
    });