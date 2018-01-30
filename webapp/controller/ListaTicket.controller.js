sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"./DemoPersoService",
	"./Formatter",
	"sap/m/TablePersoController"

], function(BaseController, MessageBox, Utilities, History, jQuery, JSONModel, DemoPersoService, Formatter, TablePersoController) {
	"use strict";
	
	return BaseController.extend("com.sap.build.standard.ticketManagement.controller.ListaTicket", {
		
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ListaTicket").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			
			// set explored app's demo model on this sample
			//var oModel = new JSONModel(jQuery.sap.getModulePath("com.sap.build.standard.ticketManagement.localService", "/TicketSet.json"));
			var oGroupingModel = new JSONModel({ hasGrouping: false});
			//this.getView().setModel(oModel);
			this.getView().setModel(oGroupingModel, 'Grouping'); 

			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.getView().byId("sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();
    
		},
		
		//Funzioni che applicano i temi belize o high contrast black 
		ApplyThemeHcb: function () {
			sap.ui.getCore().applyTheme("sap_hcb");  
		},
		
		ApplyThemeBelize: function () {
			sap.ui.getCore().applyTheme("sap_belize");  
		},
		
		//Personalizzazione visualizzazione tabella
		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},

		onTablePersoRefresh : function() {
			DemoPersoService.resetPersData();
			this._oTPC.refresh();
		},

		onTableGrouping : function(oEvent) {
			this._oTPC.setHasGrouping(oEvent.getSource().getSelected());
		},
		
		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
			if (this._oDialogSingleCustomTab) {
				this._oDialogSingleCustomTab.destroy();
			}
		},
		
		//Apre il fragment con il menu a tendina sulla destra per il setting del tema
		handleOpenDialogSingleCustomTab: function (oEvent) {
			var oButton = oEvent.getSource();

			// create menu only once
			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(
					"com.sap.build.standard.ticketManagement.view.DialogSingleCustomTab",
					this
				);
				this.getView().addDependent(this._menu);
			}

			var eDock = sap.ui.core.Popup.Dock;
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				sap.m.MessageToast.show(oEvent.getParameters().filterString);
			}
		},
		
		handleToggleSecondaryContent: function(oEvent) {
			var oSplitContainer = this.getView().byId("mySplitContainer");
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
		},
		
		ToggleSecondaryContent: function(oEvent) {
			var oSplitContainer = this.getView().byId("SplitContainer");
			var sOrientation = this.getView().byId("SplitContainer").getOrientation();
			sOrientation = "Vertical";
			this.getView().byId("SplitContainer").setOrientation(sOrientation);
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());	
		},
		
		_onButtonPress5: function(oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function(fnResolve) {
					fnResolve(true);
				})
				.then(function(result) {
					var oView = this.getView();
					var oController = this;

					return new Promise(function(fnResolve, fnReject) {
						var oModel = oController.oModel;

						var fnResetChangesAndReject = function(sMessage) {
							oModel.resetChanges();
							fnReject(new Error(sMessage));
						};
						if (oModel && oModel.hasPendingChanges()) {
							oModel.submitChanges({
								success: function(oResponse) {
									var oBatchResponse = oResponse.__batchResponses[0];
									var oChangeResponse = oBatchResponse.__changeResponses && oBatchResponse.__changeResponses[0];
									if (oChangeResponse && oChangeResponse.data) {
										var sNewContext = oModel.getKey(oChangeResponse.data);
										oView.unbindObject();
										oView.bindObject({
											path: "/" + sNewContext
										});
										if (window.history && window.history.replaceState) {
											window.history.replaceState(undefined, undefined, window.location.hash.replace(encodeURIComponent(oController.sContext),
												encodeURIComponent(sNewContext)));
										}
										oModel.refresh();
										fnResolve();
									} else if (oChangeResponse && oChangeResponse.response) {
										fnResetChangesAndReject(oChangeResponse.message);
									} else if (!oChangeResponse && oBatchResponse.response) {
										fnResetChangesAndReject(oBatchResponse.message);
									} else {
										oModel.refresh();
										fnResolve();
									}
								},
								error: function(oError) {
									fnReject(new Error(oError.message));
								}
							});
						} else {
							fnResolve();
						}
					});
					
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
		},
		
		
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
		
/*		_onButtonPress12: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("ListaTicketEspansa", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},*/
		
		_onSearchFieldLiveChange2: function(oEvent) {
			var sControlId =
				"sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335";
			var oControl = this.getView().byId(sControlId);

			// Get the search query, regardless of the triggered event ('query' for the search event, 'newValue' for the liveChange one).
			var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
			var sSourceId = oEvent.getSource().getId();

			return new Promise(function(fnResolve) {
				var aFinalFilters = [];

				var aFilters = [];
				// 1) Search filters (with OR)
				if (sQuery && sQuery.length > 0) {

					aFilters.push(new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, sQuery));

					aFilters.push(new sap.ui.model.Filter("Titolo", sap.ui.model.FilterOperator.Contains, sQuery));

					aFilters.push(new sap.ui.model.Filter("Priorita", sap.ui.model.FilterOperator.Contains, sQuery));

					aFilters.push(new sap.ui.model.Filter("Stato", sap.ui.model.FilterOperator.Contains, sQuery));

					aFilters.push(new sap.ui.model.Filter("Owner", sap.ui.model.FilterOperator.Contains, sQuery));

					aFilters.push(new sap.ui.model.Filter("Assigned_to", sap.ui.model.FilterOperator.Contains, sQuery));

				}

				var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, false)] : [];
				var oBindingOptions = this.updateBindingOptions(sControlId, {
					filters: aFinalFilters
				}, sSourceId);
				var oBindingInfo = oControl.getBindingInfo("items");
				oControl.bindAggregation("items", {
					model: oBindingInfo.model,
					path: oBindingInfo.path,
					parameters: oBindingInfo.parameters,
					template: oBindingInfo.template,
					sorter: oBindingOptions.sorters,
					filters: oBindingOptions.filters
				});
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = oBindingData.sorters === undefined ? this.mBindingOptions[sCollectionId].sorters : oBindingData.sorters;
			var oGroupby = oBindingData.groupby === undefined ? this.mBindingOptions[sCollectionId].groupby : oBindingData.groupby;

			// 1) Update the filters map for the given collection and source
			this.mBindingOptions[sCollectionId].sorters = aSorters;
			this.mBindingOptions[sCollectionId].groupby = oGroupby;
			this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
			this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (oGroupby) {
				aSorters = aSorters ? [oGroupby].concat(aSorters) : [oGroupby];
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		_onButtonPress13: function(oEvent) {

			var oSource = oEvent.getSource();
			var oSourceBindingContext = oSource.getBindingContext();

			return new Promise(function(fnResolve, fnReject) {
				if (oSourceBindingContext) {
					var oModel = oSourceBindingContext.getModel();
					oModel.remove(oSourceBindingContext.getPath(), {
						success: function() {
							oModel.refresh();
							fnResolve();
						},
						error: function() {
							oModel.refresh();
							fnReject(new Error("remove failed"));
						}
					});
				}
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress14: function(oEvent) {

			var sPopoverName = "Popover2";
			this.mPopovers = this.mPopovers || {};
			var oPopover = this.mPopovers[sPopoverName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oPopover) {
				this.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "com.sap.build.standard.ticketManagement.view." + sPopoverName
					});
					this.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oPopover = oView.getContent()[0];
					oPopover.setPlacement("Auto");
					this.mPopovers[sPopoverName] = oPopover;
				}.bind(this));
			}

			return new Promise(function(fnResolve) {
				oPopover.attachEventOnce("afterOpen", null, fnResolve);
				oPopover.openBy(oSource);
				if (oView) {
					oPopover.attachAfterOpen(function() {
						oPopover.rerender();
					});
				} else {
					oView = oPopover.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress15: function(oEvent) {

			this.mSettingsDialogs = this.mSettingsDialogs || {};
			var sSourceId = oEvent.getSource().getId();
			var oDialog = this.mSettingsDialogs["ViewSettingsDialog3"];

			var confirmHandler = function(oConfirmEvent) {
				var self = this;
				var sFilterString = oConfirmEvent.getParameter('filterString');
				var oBindingData = {};

				/* Grouping */
				if (oConfirmEvent.getParameter("groupItem")) {
					var sPath = oConfirmEvent.getParameter("groupItem").getKey();
					oBindingData.groupby = new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("groupDescending"), true);
				} else {
					// Reset the group by
					oBindingData.groupby = null;
				}

				/* Sorting */
				if (oConfirmEvent.getParameter("sortItem")) {
					var sPath = oConfirmEvent.getParameter("sortItem").getKey();
					oBindingData.sorters = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("sortDescending"))];
				}

				/* Filtering */
				oBindingData.filters = [];
				// The list of filters that will be applied to the collection
				var oFilter;
				var vValueLT, vValueGT;

				// Simple filters (String)
				var mSimpleFilters = {},
					sKey;
				for (sKey in oConfirmEvent.getParameter("filterKeys")) {
					var aSplit = sKey.split("___");
					var sPath = aSplit[1];
					var sValue1 = aSplit[2];
					var oFilterInfo = new sap.ui.model.Filter(sPath, "EQ", sValue1);

					// Creating a map of filters for each path
					if (!mSimpleFilters[sPath]) {
						mSimpleFilters[sPath] = [oFilterInfo];
					} else {
						mSimpleFilters[sPath].push(oFilterInfo);
					}
				}

				for (var path in mSimpleFilters) {
					// All filters on a same path are combined with a OR
					oBindingData.filters.push(new sap.ui.model.Filter(mSimpleFilters[path], false));
				}

				aCollections.forEach(function(oCollectionItem) {
					var oCollection = self.getView().byId(oCollectionItem.id);
					var oBindingInfo = oCollection.getBindingInfo(oCollectionItem.aggregation);
					var oBindingOptions = this.updateBindingOptions(oCollectionItem.id, oBindingData, sSourceId);
					oCollection.bindAggregation(oCollectionItem.aggregation, {
						model: oBindingInfo.model,
						path: oBindingInfo.path,
						parameters: oBindingInfo.parameters,
						template: oBindingInfo.template,
						sorter: oBindingOptions.sorters,
						filters: oBindingOptions.filters
					});

					// Display the filter string if necessary
					if (typeof oCollection.getInfoToolbar === "function") {
						var oToolBar = oCollection.getInfoToolbar();
						if (oToolBar && oToolBar.getContent().length === 1) {
							oToolBar.setVisible(!!sFilterString);
							oToolBar.getContent()[0].setText(sFilterString);
						}
					}
				}, this);
			}.bind(this);

			function resetFiltersHandler() {

			}

			function updateDialogData() {
				var mParams = {
					context: oReferenceCollection.getBindingContext(),
					success: function(oData) {
						var oJsonModelDialogData = {};
						// Loop through each entity
						oData.results.forEach(function(oEntity) {
							// Add the distinct properties in a map
							for (var oKey in oEntity) {
								if (!oJsonModelDialogData[oKey]) {
									oJsonModelDialogData[oKey] = [oEntity[oKey]];
								} else if (oJsonModelDialogData[oKey].indexOf(oEntity[oKey]) === -1) {
									oJsonModelDialogData[oKey].push(oEntity[oKey]);
								}
							}
						});

						var oDialogModel = oDialog.getModel();

						if (!oDialogModel) {
							oDialogModel = new sap.ui.model.json.JSONModel();
							oDialog.setModel(oDialogModel);
						}
						oDialogModel.setData(oJsonModelDialogData);
						oDialog.open();
					}
				};

				var sPath = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).path;
				oModel.read(sPath, mParams);
			}

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment({
					fragmentName: "com.sap.build.standard.ticketManagement.view.ViewSettingsDialog3"
				}, this);
				oDialog.attachEvent("confirm", confirmHandler);
				oDialog.attachEvent("resetFilters", resetFiltersHandler);

				this.mSettingsDialogs["ViewSettingsDialog3"] = oDialog;
			}

			var aCollections = [];

			aCollections.push({
				id: "sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335",
				aggregation: "items"
			});

			var oReferenceCollection = this.getView().byId(aCollections[0].id);
			var oSourceBindingContext = oReferenceCollection.getBindingContext();
			var oModel = oSourceBindingContext ? oSourceBindingContext.getModel() : this.getView().getModel();

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
			updateDialogData();

		},
		getCustomFilter: function(sPath, vValueLT, vValueGT) {
			if (vValueLT !== "" && vValueGT !== "") {
				return new sap.ui.model.Filter([
					new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT),
					new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT)
				], true);
			}
			if (vValueLT !== "") {
				return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT);
			}
			return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT);

		},
		getCustomFilterString: function(bIsNumber, sPath, sOperator, vValueLT, vValueGT) {
			switch (sOperator) {
				case sap.ui.model.FilterOperator.LT:
					return sPath + (bIsNumber ? ' (Less than ' : ' (Before ') + vValueLT + ')';
				case sap.ui.model.FilterOperator.BT:
					return sPath + ' (Between ' + vValueGT + ' and ' + vValueLT + ')';
				case sap.ui.model.FilterOperator.GT:
					return sPath + (bIsNumber ? ' (More than ' : ' (After ') + vValueGT + ')';
			}

		},
		filterCountFormatter: function(sValue1, sValue2) {
			return sValue1 !== "" || sValue2 !== "" ? 1 : 0;

		},
		
		onPress : function (oEvent) {
				//Press item of table ticket
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    oRouter.navTo("TicketDetail", {
					ticketId: 
				oEvent.getSource().getBindingContext().getProperty("ID")
			    });
		},
		
		
		
		_onTableItemPress2: function(oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function(fnResolve) {
				this.doNavigate("TicketDetail", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
	
		_onButtonPress16: function() {
			return new Promise(function(fnResolve) {
				sap.m.MessageBox.confirm("I seguenti ticket saranno contrassegnati come verificati", {
					title: "Conferma",
					actions: ["OK", "ANNULLA"],
					onClose: function(sActionClicked) {
						fnResolve(sActionClicked === "OK");
					}
				});
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		}
	});
}, /* bExport= */ true);