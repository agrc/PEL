define([
    'dojo/has'
], function(
    has
) {
    var baseUrl = '/arcgis/rest/services/PEL/Toolbox/GPServer';
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      The name of the app in permissions proxy.
        //      See the LoginRegister widget
        appName: 'pel',

        // version.: String
        //      The version number.
        version: '0.6.4-52326a7',

        //  apiKey: String
        //      The api key used for services on api.mapserv.utah.gov

        // extentMaxArea: number
        //      the maximum area of an extent that a report is allowed to be
        extentMaxArea: 1210000000,

        urls: {
            baseUrl: baseUrl,
            securedServicesBaseUrl: baseUrl,
            vector: '//mapserv.utah.gov/arcgis/rest/services/BaseMaps/Vector/MapServer',
            report: baseUrl + '/PEL%20Report%20for%20the%20Web',
            routeMilepost: baseUrl + '/Milepost_Segment',
            uploadUrl: baseUrl + '/uploads/upload',
            udotFeatureService: '//maps.udot.utah.gov/arcgis/rest/services/EPM_Projects/FeatureServer'
        },

        topics:{
            updateTitle: 'app/update-title',
            publishGraphic: 'app/publish-graphic',
            resetWizard: 'app/wizard-reset',
            enableTool: 'app/enable-tool',
            notifyWizardOfGeometry: 'app/report-wizard-geometry'
        }
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = '';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
    }

    return window.AGRC;
});