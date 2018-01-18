sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var DemoPersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "demoApp-productsTable-idcol",
					order: 2,
					text: "ID",
					visible: true
				},
				{
					id: "demoApp-productsTable-titolocol",
					order: 1,
					text: "Titolo",
					visible: true
				},
				{
					id: "demoApp-productsTable-prioritacol",
					order: 0,
					text: "Priorità",
					visible: false
				},
				{
					id: "demoApp-productsTable-statocol",
					order: 3,
					text: "Stato",
					visible: true
				},
				{
					id: "demoApp-productsTable-ownercol",
					order: 4,
					text: "Owner",
					visible: true
				},
				{
					id: "demoApp-productsTable-assignedcol",
					order: 5,
					text: "Assigned to",
					visible: true
				}
			]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : [
					{
								id: "demoApp-productsTable-idcol",
									order: 0,
									text: "ID",
									visible: true
								},
								{
									id: "demoApp-productsTable-titolocol",
									order: 1,
									text: "Titolo",
									visible: false
								},
								{
									id: "demoApp-productsTable-prioritacol",
									order: 4,
									text: "Priorità",
									visible: false
								},
								{
									id: "demoApp-productsTable-statocol",
									order: 2,
									text: "Stato",
									visible: true
								},
								{
									id: "demoApp-productsTable-ownercol",
									order: 3,
									text: "Owner",
									visible: true
								},
								{
									id: "demoApp-productsTable-assignedcol",
									order: 5,
									text: "Assigned to",
									visible: true
								}
							]
			};

			//set personalization
			this._oBundle = oInitialData;

			//reset personalization, i.e. display table as defined
	//		this._oBundle = null;

			oDeferred.resolve();
			return oDeferred.promise();
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('titolocol') != -1 || oColumn.getId().indexOf('idcol') != -1) {
				return "Primary Group";
			}
				return "Secondary Group";
		}
	};

	return DemoPersoService;

}, /* bExport= */ true);