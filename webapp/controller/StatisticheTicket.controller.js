sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.ticketManagement.controller.StatisticheTicket", {
		handleRouteMatched: function(oEvent) {

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				var oPath;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				}
			}

		},
		_onPageNavButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("HomeUser", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {

			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("StatisticheTicket").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oView = this.getView();
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");

			function dateDimensionFormatter(dimensionValue) {
				if (dimensionValue instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(dimensionValue);
				}
				return dimensionValue;
			}

			this.oBindingParameters = {};

			var oData = [{
				"dim0": "India",
				"mea0": "296",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "133",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "489",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "270",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "350",
				"__id": 4
			}];
			oView.getModel("staticDataModel").setData({
				"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-1-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_ColumnChart-1515512310109": oData
			}, true);
			this.oBindingParameters[
				'sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-1-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_ColumnChart-1515512310109'
			] = {
				"path": "/TicketSet",
				"parameters": {}
			};
			var aDimensions = oView.byId(
				"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-1-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_ColumnChart-1515512310109"
			).getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var oData = [{
				"dim0": "team 1",
				"mea0": "35",
				"__id": 0
			}, {
				"dim0": "team 2",
				"mea0": "43",
				"__id": 1
			}, {
				"dim0": "team 3",
				"mea0": "5",
				"__id": 2
			}, {
				"dim0": "team 4",
				"mea0": "76",
				"__id": 3
			}, {
				"dim0": "team 5",
				"mea0": "32",
				"__id": 4
			}];
			oView.getModel("staticDataModel").setData({
				"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_PieChart-1513604475519": oData
			}, true);
			this.oBindingParameters[
				'sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_PieChart-1513604475519'
			] = {
				"path": "/TicketSet",
				"parameters": {}
			};
			var aDimensions = oView.byId(
				"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_PieChart-1513604475519"
			).getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

		},
		onAfterRendering: function() {

			var oChart,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oView.getModel().getMetaModel().loaded().then(function() {
				oChart = oView.byId(
					"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-1-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_ColumnChart-1515512310109"
				);
				oChart.bindData(oBindingParameters[
					'sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-1-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_ColumnChart-1515512310109'
				]);
			});

			oView.getModel().getMetaModel().loaded().then(function() {
				oChart = oView.byId(
					"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_PieChart-1513604475519"
				);
				oChart.bindData(oBindingParameters[
					'sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1513604393273-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-sap_chart_PieChart-1513604475519'
				]);
			});

		}
	});
}, /* bExport= */ true);