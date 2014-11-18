define([
    'dojo/text!app/templates/_ReportGeometryWizardPane.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dojo/promise/all',

    'dojo/dom-class',

    'dojo/on',
    'dojo/Stateful',
    'dojo/topic',
    'dojo/json',

    'esri/request',

    'app/_ReportWizardPaneBaseMixin',

    'app/config'
], function(
    template,

    declare,
    lang,
    array,

    all,

    domClass,

    on,
    Stateful,
    topic,
    json,

    esriRequest,

    _WizardPaneBase,

    config
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare([_WizardPaneBase], {

        templateString: template,

        // numbersOnly: Regex
        numbersOnly: null,

        // activeTool: domNode
        activeTool: null,

        // toolChoiceValue: string
        // summary:
        //      shapefile, pin, route-mile-post, polygon, line
        toolChoiceValue: null,

        constructor: function() {
            // summary:
            //      constructor
            console.log('app._ReportGeometryWizardPane::constructor', arguments);

            this.numbersOnly = new RegExp('^[0-9.]+$');
            this.reportParams = new Stateful({
                geometry: null,
                buffer: 1,
                _bufferSetter: function(value) {
                    var buffer = +value;
                    if (buffer > 1) {
                        buffer = buffer / 2;
                    }

                    this.buffer = buffer;
                },
                shapefile: false,
                zip: null
            });
        },
        postCreate: function() {
            // summary:
            //       This is fired after all properties of a widget are defined,
            //       and the document fragment representing the widget is created—but
            //       before the fragment itself is added to the main document.
            console.log('app._ReportGeometryWizardPane::postCreate', arguments);

            this.setupConnections();
            this.setupDisplay();
        },
        setupConnections: function() {
            // summary:
            //      connects, subscribes, watches
            console.log('app._ReportGeometryWizardPane::setupConnections', arguments);

            this.subscribe(config.topics.notifyWizardOfGeometry, lang.hitch(this, 'setGeometry'));

            this.own(
                on(this.bufferInput, 'change, keyup, input', lang.hitch(this, 'update'))
            );

            this.reportParams.watch('geometry', lang.hitch(this, 'isValid'));
            this.reportParams.watch('buffer', lang.hitch(this, 'isValid'));
            this.reportParams.watch('shapefile', lang.hitch(this, 'isValid'));
            this.reportParams.watch('zip', lang.hitch(this, 'isValid'));
        },
        setupDisplay: function() {
            // summary:
            //      hides and shows nodes in the pane
            //
            console.log('app._ReportGeometryWizardPane::setupDisplay', arguments);

            domClass.add(this.shapefileGroup, 'hidden');
            domClass.add(this.drawingGroup, 'hidden');
            domClass.add(this.pinGroup, 'hidden');
        },
        update: function(evt) {
            // summary:
            //      updates the buffer radius
            // evt
            console.log('app._ReportGeometryWizardPane::update', arguments);

            var data = this.getDataFromTextboxEvent(evt);
            this.reportParams.set(data.prop, data.value);
        },
        isValid: function() {
            // summary:
            //      validation without events or ui updates
            //
            console.log('app._ReportGeometryWizardPane::isValid', arguments);

            var valid = this.validate();

            var hideButton = true,
                disableButton = !valid;

            this.emit('on-validate', {
                button: 'next',
                hideButton: !hideButton,
                disableButton: disableButton
            });

            return valid;
        },
        validate: function() {
            // summary:
            //      validates email and password values on keyup event
            // returns: Boolean
            console.log('app._ReportGeometryWizardPane::validate', arguments);

            if (this.reportParams.get('shapefile')) {
                return this.validateAsShapefile();
            }

            return this.validateDrawing();
        },
        validateAsShapefile: function() {
            // summary:
            //      validates the pane when shapefiles are selected
            //
            console.log('app._ReportGeometryWizardPane::validateAsShapefile', arguments);

            var file = this.reportParams.get('zip'),
                state = true,
                css = null,
                buffer = this.reportParams.buffer;

            if (!file) {
                state = false;
            }

            css = state ? 'glyphicon-ok-sign green' : 'glyphicon-exclamation-sign red';
            domClass.replace(this.fileStatus, 'glyphicon ' + css);

            if (!this.numbersOnly.test(buffer) || buffer < 0) {
                domClass.replace(this.bufferGroup, 'has-error', 'has-success');
                state = state && false;
            } else {
                domClass.replace(this.bufferGroup, 'has-success', 'has-error');
            }

            return state;
        },
        validateDrawing: function() {
            // summary:
            //      validates the unique geometry view
            console.log('app._ReportGeometryWizardPane::validateDrawing', arguments);

            var buffer = this.reportParams.buffer,
                geometry = this.reportParams.geometry;

            if (!this.numbersOnly.test(buffer) ||
                (geometry && geometry.type !== 'polygon' && buffer < 1) ||
                buffer < 0) {
                domClass.replace(this.bufferGroup, 'has-error', 'has-success');
            } else {
                domClass.replace(this.bufferGroup, 'has-success', 'has-error');
            }

            //update ui
            var css = this.reportParams.get('geometry') === null ?
                'glyphicon-exclamation-sign red' :
                'glyphicon-ok-sign green';
            domClass.replace(this.geometryStatus, 'glyphicon ' + css);

            // point | multipoint | polyline | polygon | extent
            if (!geometry || (geometry.type !== 'polygon' && buffer < 1) || buffer < 0) {
                return false;
            }

            var acceptableArea = false,
                area = 0;

            if (lang.isArray(geometry)) {
                acceptableArea = true;
            } else {
                area = this.getAreaOfExtent(geometry.getExtent(), buffer);
                acceptableArea = area <= config.extentMaxArea;
            }

            css = acceptableArea ? 'glyphicon-ok-sign green' : 'glyphicon-exclamation-sign red';
            domClass.replace(this.geometrySize, 'glyphicon ' + css);

            if (!acceptableArea) {
                var percentOver = ((area - config.extentMaxArea) / area) * 100;
                this.geometryText.innerHTML = 'Shape is too large. Reduce your shape by ' +
                    Math.round(percentOver * 100) / 100 + '%.';

                return false;
            }

            this.geometryText.innerHTML = '';

            return true;
        },
        setGeometry: function(feature) {
            // summary:
            //      topic subscription to geometry drawing
            // feature: the feature containing the geometry of the shape to use for the report
            console.log('app._ReportGeometryWizardPane::setGeometry', arguments);

            // set the geometry
            if(lang.isArray(feature)){
                var geoms = array.map(feature, function(f){
                    return f.geometry;
                });

                this.reportParams.set('geometry', geoms);
            }
            else{
                this.reportParams.set('geometry', feature.geometry);
            }
            this.reportParams.set('shapefile', false);
        },
        getAreaOfExtent: function(extent, buffer) {
            // summary:
            //      gets the area of an esri.geometry.Extent
            // extent: esri/geometry/Extent
            //      the extent to get the area from
            // buffer: number
            //      the number of feet to buffer by
            console.log('app._ReportGeometryWizardPane::getAreaOfExtent', arguments);

            var length = extent.xmax - extent.xmin,
                width = extent.ymax - extent.ymin,
                meterBuffer = 0;

            //coordinates are in meters, convert buffer to meters
            if (buffer > 0) {
                meterBuffer = 0.3048 * buffer;
            }

            length = length + meterBuffer;
            width = width + meterBuffer;

            return length * width;
        },
        uploadFile: function() {
            // summary:
            //      uploads the file to the gp service
            //
            console.log('app._ReportGeometryWizardPane::uploadFile', arguments);

            domClass.add(this.uploadActitvity, 'progress progress-striped active');

            esriRequest({
                url: config.urls.uploadUrl,
                form: this.uploadForm,
                content: {
                    f: 'json'
                },
                handleAs: 'json'
            }).then(lang.hitch(this, '_setUploadedFileId'),
                lang.hitch(this, '_uploadError'));
        },
        fetchPinGeometries: function() {
            // summary:
            //      query udot feature service for point and line geometries
            console.log('app._ReportGeometryWizardPane::fetchPinGeometries', arguments);
            if (!this.numbersOnly.test(this.pinNumber.value) || this.pinNumber.value < 0) {
                domClass.replace(this.pinGroup, 'has-error', 'has-success');
                return;
            }

            domClass.replace(this.pinGroup, 'has-success', 'has-error');

            var params = {
                where: 'PIN = ' + this.pinNumber.value,
                returnGeometry: true,
                outFields: ['PIN_DESC'],
                f: 'json'
            };

            all([esriRequest({
                    url: config.urls.udotFeatureService + '/0/query',
                    content: params,
                    handleAs: 'json'
                }),
                esriRequest({
                    url: config.urls.udotFeatureService + '/1/query',
                    content: params,
                    handleAs: 'json'
                })
            ]).then(lang.hitch(this, '_flattenFeaturesForDisplay'),
                lang.hitch(this, '_uploadError'));
        },
        _flattenFeaturesForDisplay: function(queryResults) {
            // summary:
            //      gets the promise results from quering the udot feature service
            //      takes the points and paths and flattens them into one feature for each geometyr type
            // queryResults
            console.log('app._ReportGeometryWizardPane::_flattenFeaturesForDisplay', arguments);

            var graphics = [];

            array.forEach(queryResults, function(result) {
                if (!result.geometryType) {
                    return;
                }

                var features = array.map(result.features, function(feature) {
                    feature.geometry.spatialReference = result.spatialReference;

                    return feature;
                });

                var feature;

                if (result.geometryType === 'esriGeometryMultipoint') {

                    var points = array.map(features, function(point) {
                        return point.geometry.points;
                    });

                    points = [].concat.apply([], points);

                    feature = features[0];
                    feature.geometry.points = points;
                    feature.geometry.type = 'multipoint';

                    graphics.push(feature);
                } else {
                    var paths = array.map(features, function(point) {
                        return point.geometry.paths;
                    });

                    paths = [].concat.apply([], paths);

                    feature = features[0];
                    feature.geometry.paths = paths;
                    feature.geometry.type = 'polyline';

                    graphics.push(feature);
                }
            });

            var title = graphics[0].attributes.PIN_DESC;

            if (graphics.length === 1) {
                graphics = graphics[0];
            }

            topic.publish(config.topics.updateTitle, title);
            topic.publish(config.topics.publishGraphic, graphics);
        },
        _setUploadedFileId: function(response) {
            // summary:
            //      sets the
            // response
            // {
            // 'success': true,
            // 'item': {
            //     'itemID': 'iad35b26f-8f2a-410b-aa55-0542d7bbb3b2',
            //     'itemName': 'KaneAddressPoints.zip',
            //     'description': null,
            //     'date': 1384453020224,
            //     'committed': true
            // }
            console.log('app._ReportGeometryWizardPane::_setUploadedFileId', arguments);

            domClass.remove(this.uploadActitvity, 'progress progress-striped active');

            if (!response.success) {
                return;
            }

            for (var prop in response.item) {
                if (prop !== 'itemID') {
                    delete response.item[prop];
                }
            }

            this.reportParams.set('zip', json.stringify(response.item));
        },
        toolChoice: function(evt) {
            // summary:
            //      publishes the event that a user wants to define their area of interest
            // evt: button click event
            console.log('app._ReportGeometryWizardPane::toolChoice', arguments);

            var data = this.getDataFromButtonClick(evt);
            this.toolChoiceValue = data.value;

            if (this.activeTool) {
                domClass.remove(this.activeTool, 'btn-primary');
            }

            this.activeTool = data.node;
            domClass.add(this.activeTool, 'btn-primary');

            if (data.value === 'shapefile') {
                topic.publish(config.topics.enableTool, 'shapefile');

                this.reportParams.set('shapefile', true);
                this.reportParams.geometry = null;

                domClass.remove(this.shapefileGroup, 'hidden');
                domClass.add(this.drawingGroup, 'hidden');
                domClass.add(this.pinGroup, 'hidden');

                return;
            } else if (data.value === 'pin') {
                this.reportParams.geometry = null;

                domClass.add(this.shapefileGroup, 'hidden');
                domClass.remove(this.drawingGroup, 'hidden');
                domClass.remove(this.pinGroup, 'hidden');

                return;
            }

            domClass.add(this.shapefileGroup, 'hidden');
            domClass.add(this.pinGroup, 'hidden');
            domClass.remove(this.drawingGroup, 'hidden');

            topic.publish(config.topics.enableTool, data.value);

            return data.value;
        },
        onHide: function() {
            // summary:
            //      performs actions when pane is hidden
            //
            console.log('app._ReportGeometryWizardPane::onHide', arguments);

            topic.publish(config.topics.enableTool);
        },
        _uploadError: function(e) {
            // summary:
            //      updates ui for error reasons
            // e
            console.log('app._ReportGeometryWizardPane::_uploadError', arguments);

            domClass.remove(this.uploadActitvity, 'progress progress-striped active');

            alert(e.message);
        }
    });
});