/*globals AGRC:true*/
require([
        'app/ReportGeneratorWizard',

        'dojo/dom-construct',

        'dojo/_base/window',

        'esri/tasks/FeatureSet',
        'esri/geometry/Polyline',
        'esri/graphic'
    ],

    function(
        WidgetUnderTest,

        domConstruct,

        win,

        FeatureSet,
        Geometry,
        Graphic
    ) {
        describe('app/ReportGeneratorWizard', function() {
            var testWidget;
            beforeEach(function() {
                testWidget = new WidgetUnderTest({},
                    domConstruct.create('div', {}, win.body()));
                testWidget.startup();
                AGRC = {
                    extentMaxArea: 1210000000
                };
            });
            afterEach(function() {
                testWidget.destroy();
                testWidget = null;
            });

            it('creates a valid object', function() {
                expect(testWidget).toEqual(jasmine.any(WidgetUnderTest));
            });

            describe('CollectData', function() {
                it('collects all the keys from the panes stateful object', function() {
                    var polyline = new Geometry({
                        'type': 'polyline',
                        'paths': [
                            [
                                [242994.6799999997, 4514126.4399999995],
                                [243094, 4514138.92],
                                [243228.6299999999, 4514162.800000001],
                                [250811.23000000045, 4514150.75]
                            ]
                        ],
                        '_path': 0,
                        'spatialReference': {
                            'wkid': 26912,
                            'latestWkid': 26912
                        },
                        '_extent': {
                            'xmin': 242994.6799999997,
                            'ymin': 4514126.4399999995,
                            'xmax': 250811.23000000045,
                            'ymax': 4515030.01,
                            'spatialReference': {
                                'wkid': 26912,
                                'latestWkid': 26912
                            }
                        },
                        '_partwise': null
                    });

                    testWidget.panes[0].reportParams.set('type', 'main');
                    testWidget.panes[1].reportParams.set('buffer', 1);
                    testWidget.panes[1].reportParams.set('geometry', polyline);
                    testWidget.panes[2].reportParams.set('name', 'my report');

                    var data = testWidget.collectData();
                    expect(data).toEqual({
                        type: 'main',
                        buffer: 1,
                        geometry: polyline,
                        name: 'my report',
                        shapefile: false,
                        zip: null
                    });
                });
                it('transforms data for the gp tool', function () {
                    var polyline = new Geometry({
                        'type': 'polyline',
                        'paths': [
                            [
                                [242994.6799999997, 4514126.4399999995],
                                [243094, 4514138.92],
                                [243228.6299999999, 4514162.800000001],
                                [250811.23000000045, 4514150.75]
                            ]
                        ],
                        '_path': 0,
                        'spatialReference': {
                            'wkid': 26912,
                            'latestWkid': 26912
                        },
                        '_extent': {
                            'xmin': 242994.6799999997,
                            'ymin': 4514126.4399999995,
                            'xmax': 250811.23000000045,
                            'ymax': 4515030.01,
                            'spatialReference': {
                                'wkid': 26912,
                                'latestWkid': 26912
                            }
                        },
                        '_partwise': null
                    });

                    testWidget.planner = {email:'testuser'};
                    var data = {
                        type: 'main',
                        buffer: 1,
                        geometry: polyline,
                        name: 'my report',
                        shapefile: false,
                        zip: null
                    };

                    var gpData = testWidget.transformData(data);

                    var graphic = new Graphic(polyline);
                    var featureSet = new FeatureSet();
                    featureSet.features.push(graphic);

                    expect(gpData).toEqual({
                        bufferDistance: 1,
                        multipoints: null,
                        polygons: null,
                        planner: 'testuser',
                        polylines: featureSet,
                        projectName: 'my report',
                        reportType: 1,
                        zipFile: null
                    });
                });
                it('divides buffer in half for use in reports', function() {
                    var polyline = new Geometry({
                        'type': 'polyline',
                        'paths': [
                            [
                                [242994.6799999997, 4514126.4399999995],
                                [243094, 4514138.92],
                                [243228.6299999999, 4514162.800000001],
                                [250811.23000000045, 4514150.75]
                            ]
                        ],
                        '_path': 0,
                        'spatialReference': {
                            'wkid': 26912,
                            'latestWkid': 26912
                        },
                        '_extent': {
                            'xmin': 242994.6799999997,
                            'ymin': 4514126.4399999995,
                            'xmax': 250811.23000000045,
                            'ymax': 4515030.01,
                            'spatialReference': {
                                'wkid': 26912,
                                'latestWkid': 26912
                            }
                        },
                        '_partwise': null
                    });

                    testWidget.panes[0].reportParams.set('type', 'main');
                    testWidget.panes[1].reportParams.set('buffer', 100);
                    testWidget.panes[1].reportParams.set('geometry', polyline);
                    testWidget.panes[2].reportParams.set('name', 'my report');

                    var data = testWidget.collectData();
                    expect(data).toEqual({
                        type: 'main',
                        buffer: 50,
                        geometry: polyline,
                        name: 'my report',
                        shapefile: false,
                        zip: null
                    });
                });
            });

            describe('valid', function() {
                it('validates all panes', function() {
                    var polyline = new Geometry({
                        'type': 'polyline',
                        'paths': [
                            [
                                [242994.6799999997, 4514126.4399999995],
                                [243094, 4514138.92],
                                [243228.6299999999, 4514162.800000001],
                                [250811.23000000045, 4514150.75]
                            ]
                        ],
                        '_path': 0,
                        'spatialReference': {
                            'wkid': 26912,
                            'latestWkid': 26912
                        },
                        '_extent': {
                            'xmin': 242994.6799999997,
                            'ymin': 4514126.4399999995,
                            'xmax': 250811.23000000045,
                            'ymax': 4515030.01,
                            'spatialReference': {
                                'wkid': 26912,
                                'latestWkid': 26912
                            }
                        },
                        '_partwise': null
                    });

                    testWidget.panes[0].reportParams.set('type', 'main');
                    testWidget.panes[1].reportParams.set('buffer', 1);
                    testWidget.panes[1].reportParams.set('geometry', polyline);
                    testWidget.panes[2].reportParams.set('name', 'my report');

                    spyOn(testWidget.panes[0], 'validate').and.callThrough();
                    spyOn(testWidget.panes[1], 'validate').and.callThrough();
                    spyOn(testWidget.panes[2], 'validate').and.callThrough();

                    expect(testWidget.isValid()).toEqual(true);
                    expect(testWidget.panes[0].validate).toHaveBeenCalled();
                    expect(testWidget.panes[1].validate).toHaveBeenCalled();
                    expect(testWidget.panes[2].validate).toHaveBeenCalled();
                });
            });
        });
    });