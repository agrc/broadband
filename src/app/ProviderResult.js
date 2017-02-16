define([
    'app/config',

    'dijit/Tooltip',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/templates/ProviderResult.html',
    'dojo/_base/declare',

    'dojox/charting/Chart2D',
    'dojox/charting/Theme'
], function (
    config,

    Tooltip,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domConstruct,
    template,
    declare,

    Chart2D,
    Theme
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        /**
         * Summary:
         * The row in the provider results table that shows the name and speeds chart along
         * with associated tooltip
         */

        widgetsInTemplate: true,
        templateString: template,

        id: '', // unique id of provider
        url: '', // url to provider website
        name: '', // colloqial name
        index: 0, // used to assign even-row class
        maxdown: 0, // max ad down
        maxup: 0, // max ad up
        maxdownDesc: '', // description from domain
        maxupDesc: '', // description from domain
        transTypes: [], // list of transmission types

        postCreate: function () {
            // assign even row
            if ((this.index + 1) % 2 === 0) {
                domClass.add(this.domNode, 'even-row');
            }

            var normalize = function (value) {
                var endTier = 1;
                while (value < config.speedsDomain[endTier + '']) {
                    endTier++;
                }

                return 11 - endTier;
            };

            this.maxup = normalize(this.maxup);
            this.maxdown = normalize(this.maxdown);

            this.buildTooltip();

            this.buildChart();
        },

        buildTooltip: function () {
            // tooltip
            new Tooltip({
                connectId: this.id,
                label: this.ttContent.innerHTML,
                showDelay: 0
            });
        },

        /**
         * Build chart and puts it in td
         */
        buildChart: function () {
            var div = domConstruct.create('div', null, this.speedChart);
            domClass.add(div, 'chart-div');

            // make new chart
            var chart1 = new Chart2D(div, {
                fill: null,
                stroke: null,
                margins: {
                    l: 0,
                    r: 0,
                    t: 0,
                    b: 0
                }
            }).addPlot('default', {
                type: 'ClusteredBars'
            }).addAxis('x', {
                type: 'Invisible',
                min: 1,
                max: 10,
                majorLabels: false,
                minorTicks: false,
                minorLabels: false,
                majorTick: {
                    length: 0
                },
                minorTick: {
                    length: 0
                }
            }).addSeries('Upload Series', [{
                y: this.maxup
            }], {
                fill: '#AAD0F2',
                stroke: '#AAD0F2'
            }).addSeries('Download Series', [{
                y: this.maxdown
            }], {
                fill: '#769DC0',
                stroke: '#769DC0'
            }).setTheme(new Theme({
                plotarea: {
                    fill: 'transparent',
                    stroke: null
                }
            }));
            chart1.render();
        }
    });
});
