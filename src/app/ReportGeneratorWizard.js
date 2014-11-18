define([
    'dojo/text!app/templates/ReportGeneratorWizard.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/_ReportWizardControlPanel',
    'app/_ReportTypeWizardPane',
    'app/_ReportGeometryWizardPane',
    'app/_ReportNameWizardPane',
    'app/_ReportWizardAsyncGeoprocessing',

    'app/config',

    'esri/tasks/FeatureSet',
    'esri/graphic',


    'dijit/layout/StackContainer'
], function(
    template,

    declare,
    lang,
    array,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    ControlPanel,
    TypePane,
    GeometryPane,
    NamePane,
    AsyncGp,

    config,

    FeatureSet,
    Graphic
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, AsyncGp], {
        baseClass: 'report-wizard',

        widgetsInTemplate: true,

        templateString: template,

        //the planners details
        planner: null,

        constructor: function() {
            // summary:
            //      constructor
            console.log('app.ReportGeneratorWizard::constructor', arguments);

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      dom is ready
            console.info('app.ReportGeneratorWizard::postCreate', arguments);

            this.url = config.urls.report;

            this.inherited(arguments);

            this.setupWizard();

            this.setupConnections();
        },
        setupWizard: function() {
            // summary:
            //      sets up the wizard pane functionality
            console.log('app.ReportGeneratorWizard::setupWizard', arguments);

            var reportTypePane = new TypePane({
                    parentWidget: this
                }, this.cp1),

                geometryPane = new GeometryPane({
                    parentWidget: this
                }, this.cp2),

                reportTitlePane = new NamePane({
                    parentWidget: this
                }, this.cp3),

                controls = new ControlPanel({
                    parentWidget: this,
                    panes: [reportTypePane, geometryPane, reportTitlePane]
                }, this.controlPanelNode);

            this.panes = [reportTypePane, geometryPane, reportTitlePane];

            controls.startup();
            this.sc.startup();
        },
        setupConnections: function() {
            // summary:
            //      sets up the connections obviously
            console.log('app.ReportGeneratorWizard::setupConnections', arguments);

            this.subscribe('LoginRegister/sign-in-success', lang.hitch(this, function(response) {
                this.planner = response.user;
            }));
        },
        isValid: function() {
            console.info('app.ReportGeneratorWizard::isValid', arguments);

            // validate all the panes
            return array.every(this.panes, function(pane) {
                return pane.validate();
            }, this);
        },
        submit: function() {
            // summary:
            //      handles the submitting of the wizard
            // evt: the mouse click or submission event
            console.log('app.ReportGeneratorWizard::submit', arguments);

            if (!this.isValid()) {
                return false;
            }

            var data = this.collectData();

            var gpData = this.transformData(data);

            this.submitJob(gpData);

            return true;
        },
        collectData: function() {
            // summary:
            //      collects the data parts from the various panes
            //
            console.log('app.ReportGeneratorWizard::collectData', arguments);
            var data = {};

            array.forEach(this.panes, function(pane) {
                for (var x in pane.reportParams) {
                    if (pane.reportParams.hasOwnProperty(x) &&
                        x !== '_watchCallbacks' && !lang.isFunction(pane.reportParams[x])) {
                        data[x] = pane.reportParams.get(x);
                    }
                }
            }, this);

            return data;
        },
        transformData: function(data) {
            // summary:
            //      modifies the data for the gp service
            // data: object
            //      the data collected from the wizard panes
            console.log('app.ReportGeneratorWizard::transformData', arguments);

            var gpObject = {
                bufferDistance: data.buffer,
                multipoints: new FeatureSet(),
                polygons: new FeatureSet(),
                planner: this.planner.email,
                polylines: new FeatureSet(),
                projectId: this.planner.first + this.planner.last,
                reportType: data.type === 'catex' ? 0 : 1,
                zipFile: null
            };

            if (data.geometry) {
                if (lang.isArray(data.geometry)) {
                    array.forEach(data.geometry, function(geometry) {
                        var g = new Graphic(geometry);
                        this._addToFeatureSet(g, gpObject);
                    }, this);
                } else {
                    var g = new Graphic(data.geometry);
                    this._addToFeatureSet(g, gpObject);
                }
            } else {
                gpObject.zipFile = data.zip;
            }

            var clearNulls = function(featureSet){
                if(featureSet.features.length === 0){
                    return null;
                }

                return featureSet;
            };

            gpObject.polylines = clearNulls(gpObject.polylines);
            gpObject.multipoints = clearNulls(gpObject.multipoints);
            gpObject.polygons = clearNulls(gpObject.polygons);

            return gpObject;
        },
        _addToFeatureSet: function(graphic, gp) {
            // summary:
            //      adds the graphic to the right feature set
            // graphic, polylines, multipoints, polygons
            console.log('app.ReportGeneratorWizard::_addToFeatureSet', arguments);

            if (graphic.geometry.type === 'polyline') {
                gp.polylines.features.push(graphic);
            } else if (graphic.geometry.type === 'multipoint') {
                gp.multipoints.features.push(graphic);
            } else if (graphic.geometry.type === 'polygon') {
                gp.polygons.features.push(graphic);
            }
        }
    });
});