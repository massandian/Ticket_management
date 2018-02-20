sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"./DemoPersoService",
	"./Formatter",
	"sap/m/TablePersoController",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/MessageToast"

], function(BaseController, MessageBox, Utilities, History, jQuery, JSONModel, DemoPersoService, Formatter, TablePersoController, Filter, Sorter, MessageToast) {
	"use strict";
	
	return BaseController.extend("com.sap.build.standard.ticketManagement.controller.ListaTicket", {
		
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ListaTicket").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("com.sap.build.standard.ticketManagement.localService", "/TicketSet.json"));
			var oGroupingModel = new JSONModel({ hasGrouping: false});
			this.getView().setModel(oModel);
			this.getView().setModel(oGroupingModel, 'Grouping'); 

			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.getView().byId("sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();
			
			
			//Funzioni di raggruppamento
			this.mGroupFunctions = {
				Stato: function(oContext) {
					var stato = oContext.getProperty("Stato");
					return {
						key: stato,
						text: stato
					};
				},
				Priorita: function(oContext) {
					var priorita = oContext.getProperty("Priorita");
					return {
						key: priorita,
						text: priorita
					};
				},
				Owner: function(oContext) {
					var owner = oContext.getProperty("Owner");
					return {
						key: owner,
						text: owner
					};
				},
				Assigned_to: function(oContext) {
					var assigned_to = oContext.getProperty("Assigned_to");
					return {
						key: assigned_to,
						text: assigned_to
					};
				}
			};
			
			//Dichiarato oggetto che contiene le regole per la definizione dei filtri custom
			this._data = {      
					CustomFilterCollection : [
						            	{"Nome" : ['ID', 'Titolo', 'Descrizione', 'Stato', 'Priorita', 'Owner', 'Categoria', 'Assigned_to'],
						            	 "Tipo": ["COMPRESO TRA", "UGUALE", "DIVERSO DA", "CONTIENE"]}
						    	      ],	
						          
										        
					OrdinaCollection : [{ID:"1", Nome:"ID"},
										{Nome:"Titolo", ID:"2"},
										{Nome:"Descrizione", ID:"3"},
										{ID:"4", Nome:"Stato"},
										{ID:"5", Nome:"Priorita"},
										{Nome:"Owner", ID:"6"},
										{Nome:"Assigned_to", ID:"7"},
										{Nome:"Categoria", ID:"8"}
						
						]
					
			};
			
			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);
			
		},
		
		
		onBeforeRendering: function() {
			
			this.byId('CustomFilter').setModel(this.jModel);
			this.byId('OrdinaCampi').setModel(this.jModel);
		
		},
		
		fetchRecords : function(){
		
			//data will be in this._data.Custom filter
			console.log(this._data.CustomFilterCollection);
		
		},
		
		//Funzione che edita in tempo reale l'espressione matematica del filtro custom definito
		handleLiveChange: function(oEvent) {
			
				var oldValue = oEvent.getParameter("value");
				var newValue = oEvent.getParameter("value");
				this.getView().byId('getValue').setText(newValue + " " + oldValue);
			
		},
	
		addRowAND : function(){
			//Inserisce una nuova riga all'interno dei filtri custom per stabilire una nuova regola
			
			this._data.CustomFilterCollection.push({"Nome" : ['ID', 'Titolo', 'Descrizione', 'Stato', 'Priorita', 'Owner', 'Categoria', 'Assigned_to'],
						            				"Tipo": ["COMPRESO TRA", "UGUALE", "DIVERSO DA", "CONTIENE"]});
		
			this.jModel.refresh();	//which will add the new record
			this.getView().byId('getValue').setText("AND");
		},
		
		addRowOR : function(){
			
			//Inserisce una nuova riga all'interno dei filtri custom per stabilire una nuova regola
			
			this._data.CustomFilterCollection.push({"Nome" : ['ID', 'Titolo', 'Descrizione', 'Stato', 'Priorita', 'Owner', 'Categoria', 'Assigned_to'],
						            				"Tipo": ["COMPRESO TRA", "UGUALE", "DIVERSO DA", "CONTIENE"]});
		
			this.jModel.refresh();	//which will add the new record
			this.getView().byId('getValue').setText("OR");
		},
		
		deleteRow : function(oArg){
			//Al press del tasto di cancellazione, elimina una riga per la dichiarazione di un filtro custom
			var deleteRecord = oArg.getSource().getBindingContext().getObject();
			for(var i=1 ; i<this._data.CustomFilterCollection.length ; i++){
				if (this._data.CustomFilterCollection[i] === deleteRecord )
					{
					//	pop this._data.CustomFilter[i] 
						this._data.CustomFilterCollection.splice(i,1); //rimuove un record dalla tabella in tempo reale
						this.jModel.refresh();
						break;//esci dal loop
					}
			}
			this.getView().byId('getValue').setText();
		},
		
		
		//Funzioni che applicano i temi belize o high contrast black 
		ApplyThemeHcb: function () {
			sap.ui.getCore().applyTheme("sap_bluecrystal");  
		},
		
		ApplyThemeBelize: function () {
			sap.ui.getCore().applyTheme("sap_belize");  
		},
		
		//Personalizzazione visualizzazione tabella con dialog 
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
			else if (this._oDialogSingleCustomTab) {
				this._oDialogSingleCustomTab.destroy();
			}
		},
		
		//Apertura context menu per il setting del tema
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

		//Nasconde e visualizza il secondary content della pagina sulla sinistra
		handleToggleSecondaryContent: function(oEvent) {
			
			var oSplitContainer = this.getView().byId("mySplitContainer");
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
		},
		
		//Nasconde e visualizza il secondary content con le regole di filtro custom
		ToggleSecondaryContent: function(oEvent) {
			
			var oSplitContainer = this.getView().byId("SplitContainer");
			var sOrientation = this.getView().byId("SplitContainer").getOrientation();
			sOrientation = "Vertical";
			this.getView().byId("SplitContainer").setOrientation(sOrientation);
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
			
		},
		
		//Apertura confirm box e salvataggio del custom filter appena creato
		_onButtonPress5: function(oEvent) {

			this.ToggleSecondaryContent();
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
											window.history.replaceState(undefined, undefined, window.location.hash.replace(encodeURIComponent(oController.sContext), encodeURIComponent(sNewContext)));
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

				}.bind(this))
				.then(function(result) {
					if (result === false) {
						return false;
					} else {
						return new Promise(function(fnResolve) {
							sap.m.MessageBox.confirm("Il filtro custom sarà salvato nel sistema", {
								title: "Filtro Custom",
								actions: ["OK", "Annulla"],
								onClose: function(sActionClicked) {
									fnResolve(sActionClicked === "OK");
								}
							});
						});

					}
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
				
		},
		
		//Regole di routing
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
			this.onFilterTicketList();                         
		},
		
		onFilterTicketList: function() {
		
			/*if (sap.n.oTicketStato === "da verificare") {
        		//Filtra il ticket selezionato nella tabella e produce4 i risultati nella pagina di dettaglio (dettagli)       
    			var oTicketStato = sap.n.oTicketStato;
			    var listTicket = this.getView().byId("__component0---ListaTicket--sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335");
			    var oFilterByTicketStato = new sap.ui.model.Filter("Stato", sap.ui.model.FilterOperator.EQ, oTicketStato);
		      	listTicket.getBinding("items").filter(oFilterByTicketStato);
		      	
    	    }*/
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
		
		/*_onButtonPress12: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("ListaTicketEspansa", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},*/
		
		
		//Funzione che gestisce la barra di ricerca dei ticket
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
		
		//Funzione associata al bottone clear (pulisce tutti i filtri, gli ordinamenti e i raggruppamenti inseriti)
		_onButtonPress13: function(oEvent) {
			
			//Clear all sortings and grouping rules
			var oTable = this.getView().byId("sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335");
			oTable.getBinding("items").sort(null);
			oTable.getBinding("items").filter(null);
			oTable.getBinding("items").order(null);
			
		},
		
		//Funzione che apre la dialog per la definizione delle regole di filtro standard
		handleViewSettingsDialogButtonPressed: function(oEvent) {

			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.sap.build.standard.ticketManagement.view.ViewSettingsDialog3", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		
		handleConfirm: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("sap_Responsive_Page_0-content-sap_ui_layout_BlockLayout-1515407526987-content-sap_ui_layout_BlockLayoutRow-2-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1515407548335");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var sPath;
			var bDescending;
			var vGroup;
			var aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var oFilter = new Filter(sPath, sOperator, sValue1);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);
			
		},
		
		
		//Funzioni implementate per la gestione dei custom filter lato frontend (non ancora utilizzate)
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
		
		//Evento press di un ticket specifico
		onPress : function (oEvent) {
				
				sap.n =  {};
				sap.n.oTicketId = oEvent.getSource().getBindingContext().getProperty("ID");
				sap.n.oChatID = oEvent.getSource().getBindingContext().getProperty("ID");
				
				//Press item of the ticket table
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    oRouter.navTo("TicketDetail", {
					oTicketId:oEvent.getSource().getBindingContext().getProperty("ID"),
					oChatID:oEvent.getSource().getBindingContext().getProperty("ID")
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
				sap.m.MessageBox.confirm("I ticket selezionati saranno contrassegnati come verificati", {
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