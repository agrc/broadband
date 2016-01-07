define([
    'app/config',

    'dijit/Dialog',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/ListPicker.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dijit/form/Button',
    'dijit/form/MultiSelect',
    'xstyle/css!app/resources/ListPicker.css'
],

function (
    config,

    Dialog,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    query,
    template,
    topic,
    array,
    declare,
    lang
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        /**
         * Summary:
         * Widget used to create a subset from a large list of options.
         * Similar to the layer picker in the Legend wizard in ArcMap
         *
         * Got some code for extending dijit.Dialog from here:
         * http://heather.koyuk.net/refractions/?p=246
         */

        widgetsInTemplate: true,
        templateString: template,

        dialog: null,

        // options
        // name of list
        listName: 'listName',
        // Array that the available list values will be populated with
        availableListArray: [],

        constructor: function () {

        },

        postMixInProperties: function () {
            this.dialog = new Dialog({});
            this.inherited(arguments);
        },

        postCreate: function () {
            this.dialog.closeButtonNode.onClick = lang.hitch(this, 'hide');
            this.inherited(arguments);

            // set dialog content
            this.dialog.set('content', this.domNode);

            // set titles
            this.dialog.set('title', this.listName + ' Filter');
            this.availableTitle.innerHTML = this.listName;
            this.selectedTitle.innerHTML = 'Show Data For These ' + this.listName;

            // sort values and populate multiselect from array
            this.availableListArray.sort();
            array.forEach(this.availableListArray, function (item) {
                var option = domConstruct.create('option');
                option.innerHTML = item[0].replace('&', '&amp;'); // replace & for IE
                option.value = item[1];
                this.availableList.domNode.appendChild(option);
            }, this);

            this._wireControlEvents();

            this.availableList.addSelected = this.addSelectedOverride;
            this.selectedList.addSelected = this.addSelectedOverride;
        },

        _wireControlEvents: function () {
            this.connect(this.btnSelect, 'onClick', '_onSelect');
            this.connect(this.btnSelectAll, 'onClick', '_onSelectAll');
            this.connect(this.btnUnselect, 'onClick', '_onUnselect');
            this.connect(this.btnUnselectAll, 'onClick', '_onUnselectAll');
            this.connect(this.btnOK, 'onClick', '_onOK');
            this.connect(this.btnCancel, 'onClick', '_onCancel');
            this.connect(this.availableList, 'onDblClick', '_onSelect');
            this.connect(this.selectedList, 'onDblClick', '_onUnselect');
        },

        _onSelect: function () {
            // get selected options from available and add to selected
            this.selectedList.addSelected(this.availableList);

            // enable OK button
            this.btnOK.set('disabled', false);
        },

        _onSelectAll: function () {
            // move all options from available to selected
            query('> option', this.availableList.domNode).forEach(function (option) {
                option.selected = true;
            });
            this._onSelect();
        },

        _onUnselect: function () {
            // get selected options from selected and move to available
            this.availableList.addSelected(this.selectedList);

            // disable OK button if there are no providers left in selected
            var v = this.selectedList.domNode.childNodes;
            if (v.length <= 0) {
                this.btnOK.set('disabled', true);
            }
        },

        _onUnselectAll: function () {
            console.log(this.declaredClass + '::_onUnselectAll', arguments);
            // move all options from selected to available
            query('> option', this.selectedList.domNode).forEach(function (option) {
                option.selected = true;
            });
            this._onUnselect();
        },

        _onOK: function () {
            // build array of selected items
            var selectedItems = [];
            query('> option', this.selectedList.domNode).forEach(function (option) {
                selectedItems.push([option.text, option.value]);
            });

            this.hide();

            topic.publish(config.topics.listpickerOnOK, selectedItems);
        },

        _onCancel: function () {
            this.hide();
        },

        show: function () {
            this.dialog.show();
        },

        hide: function () {
            this.dialog.hide();
        },

        addSelectedOverride: function (select) {
            // this function has been altered to insert the new item(s) alphabetically
            select.getSelected().forEach(function (n) {
                // the node that the new item is going to be inserted before
                var refNode;

                // sort through existing options until you find the refNode
                query('> option', this.domNode).some(function (option) {
                    if (n.text > option.text) {
                        return false;
                    } else {
                        refNode = option;
                        return true;
                    }
                }, this);

                if (refNode) {
                    domConstruct.place(n, refNode, 'before');
                } else {
                    // just slap it in there if there are no children
                    this.containerNode.appendChild(n);
                }

                // scroll to bottom to see item
                // cannot use scrollIntoView since <option> tags don't support all attributes
                // does not work on IE due to a bug where <select> always shows scrollTop = 0
                this.domNode.scrollTop = this.domNode.offsetHeight; // overshoot will be ignored
                // scrolling the source select is trickier esp. on safari who forgets to change the scrollbar size
                var oldscroll = select.domNode.scrollTop;
                select.domNode.scrollTop = 0;
                select.domNode.scrollTop = oldscroll;
            },this);
        },
        selectProviders: function (providerValues) {
            // summary:
            //      manually selects the providers. Called by app/Router
            // providerValues: String[]
            console.log(this.declaredClass + '::selectProviders', arguments);

            var that = this;

            // clear any previously selected providers
            this._onUnselectAll();
            query('option', this.domNode).forEach(function (node) {
                node.selected = false;
            });

            array.forEach(providerValues, function (prov) {
                array.some(that.availableList.domNode.children, function (option) {
                    if (option.value === prov) {
                        option.selected = true;
                        return true;
                    } else {
                        return false;
                    }
                });
            });

            this._onSelect();

            if (!config.mapDataFilter.showResetDialog) {
                this._onOK();
            } else {
                config.mapDataFilter.showResetDialog = false;
                this._onOK();
                config.mapDataFilter.showResetDialog = true;
            }
        }
    });
});
