define([
    'app/_DialogMixin',
    'app/config',
    'app/Router',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/hash',
    'dojo/query',
    'dojo/text!app/templates/PrintDialog.html',

    'esri/tasks/PrintParameters',
    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate',

    'ijit/modules/_ErrorMessageMixin',

    'dijit/form/Button',
    'xstyle/css!app/resources/PrintDialog.css'
], function (
    _DialogMixin,
    config,
    Router,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
    lang,
    domClass,
    hash,
    query,
    template,

    PrintParameters,
    PrintTask,
    PrintTemplate,

    _ErrorMessageMixin
) {
    return declare([
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _DialogMixin,
        _ErrorMessageMixin
    ], {
        // description:
        //      Fires off the print task and reports back the link to the user.

        templateString: template,
        widgetsInTemplate: true,
        baseClass: 'print-dialog',

        // params: PrintParameters
        params: null,

        // task: PrintTask
        task: null,


        // Properties to be sent into constructor

        // map: esri/Map
        map: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.PrintDialog::postCreate', arguments);

            this.btnText = this.printBtn.get('label');

            var template = new PrintTemplate();
            template.layout = 'Main';
            template.format = 'PDF';

            this.params = new PrintParameters();
            this.params.map = this.map;
            this.params.template = template;

            this.task = new PrintTask(config.exportWebMapUrl);

            this.own(
                this.task.on('complete', lang.hitch(this, 'onComplete')),
                this.task.on('error', lang.hitch(this, 'onError'))
            );

            this.inherited(arguments);
        },
        onComplete: function (evt) {
            // summary:
            //      show download link
            // evt: {result: {url: String}}
            console.log('app/PrintDialog:onComplete', arguments);

            this.downloadLink.href = evt.result.url;
            domClass.remove(this.downloadLink, 'hidden');

            this.hideLoader();
        },
        onError: function (evt) {
            // summary:
            //      print service errored
            // evt: {error: Error}
            console.log('app/PrintDialog:onError', arguments);

            this.showErrMsg(evt.error.message);
            this.hideLoader();
        },
        showLoader: function (msg) {
            // summary:
            //      disables the print button and sets message text
            // msg: String
            console.log('app/map/Print:showLoader', arguments);

            this.hideErrMsg();
            this.hideLink();

            this.printBtn.set('disabled', true);
            this.printBtn.set('innerHTML', msg);

            query('.alert', this.domNode).forEach(function (n) {
                domClass.add(n, 'hidden');
            });
        },
        hideLoader: function () {
            // summary:
            //      resets the button
            console.log('app/map/Print:hideLoader', arguments);

            this.printBtn.set('disabled', false);
            this.printBtn.set('innerHTML', this.btnText);
        },
        hideLink: function () {
            // summary:
            //      hides the link after the user clicks on it
            console.log('app/map/Print:hideLink', arguments);

            domClass.add(this.downloadLink, 'hidden');
        },
        print: function () {
            // summary:
            //      kicks off print service
            console.log('app/PrintDialog:print', arguments);

            this.showLoader('Processing');

            this.params.template.layoutOptions = {
                customTextElements: this.getCustomTextElements(hash())
            };

            this.task.execute(this.params);
        },
        getCustomTextElements: function (hash) {
            // summary:
            //      formats an object to provide content for the
            //      custom text elements in the print template
            // hash: String
            //      The string of the current hash
            // returns: Object[]
            console.log('app/PrintDialog:getCustomTextElements', arguments);

            if (hash === '') {
                return [];
            }

            var routeObj = Router.prototype.queryToObject(hash.slice(7));

            var obj = [];

            if (routeObj.transTypes) {
                var techs = [];
                array.forEach(routeObj.transTypes, function (tt) {
                    tt = config.typesDomain[tt];
                    if (array.indexOf(techs, tt) === -1) {
                        techs.push(tt);
                    }
                });
                obj.push({techs: techs.join('\n')});
            }
            if (routeObj.minDownSpeed) {
                var down = config.speedsDomain[routeObj.minDownSpeed] + '+ Mbps Download';
                var up = config.speedsDomain[routeObj.minUpSpeed] + '+ Mbps Upload';

                obj.push({speeds: down + '\n' + up});
            }
            if (routeObj.providers) {
                obj.push({providers: routeObj.providers.join('\n')});
            }

            return obj;
        }
    });
});
