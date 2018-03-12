sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat"
], function(BaseController, MessageBox, Utilities, History, JSONModel, MessageToast, DateFormat) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.ticketManagement.controller.TicketDetail", {
	
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TicketDetail").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.oModel = this.getOwnerComponent().getModel();
			
			// set mock model
		
			var sPath = jQuery.sap.getModulePath("com.sap.build.standard.ticketManagement.localService", "/TicketSet.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			
			// set the possible screen sizes
			var oCarouselContainer = {
				screenSizes : [
					"350px",
					"420px",
					"555px",
					"743px",
					"908px"
				]
			};
			var oScreenSizesModel = new JSONModel(oCarouselContainer);
			this.getView().setModel(oScreenSizesModel, "ScreenSizesModel");

			
		},
		
		
		onPost: function (oEvent) {
			
			var oFormat = DateFormat.getDateTimeInstance({style: "medium"});
			var oDate = new Date();
			var sDate = oFormat.format(oDate);
		
			// create new entry
			var sValue = oEvent.getParameter("value");
			var oEntry = {
				Author : "Davide Massa",
				AuthorPicUrl : "",
				Type : "Reply",
				Date : "" + sDate,
				Text : sValue,
				ID : sap.n.oTicketId
			};

			// update model 
			var oModel = this.getView().getModel();
			var aEntries = oModel.getData().ChatCollection;
			var eEntries = oModel.getData().TicketCollection;
			aEntries.unshift(oEntry);
			oModel.setData({
				ChatCollection : aEntries,
				TicketCollection : eEntries
			});
			this.oModel.refresh();
			
			//Toast message invio	
			MessageToast.show("Messaggio inviato");
		},

		onSenderPress: function (oEvent) {
			MessageToast.show("Clicked on Link: " + oEvent.getSource().getSender());
		},

		onIconPress: function (oEvent) {
			MessageToast.show("Clicked on Image: " + oEvent.getSource().getSender());
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
		
			this.onFilterTicketDetail();
			this.onFilterTicketScreenshot();
			this.onFilterTicketScreenshot1();
			this.onFilterTicketChat();
		},
		
		//Filtraggio dei dati del ticket nella pagina di dettaglio
		onFilterTicketDetail: function() {
			
    		if (sap.n.oTicketId) {
        		//Filtra il ticket selezionato nella tabella e produce4 i risultati nella pagina di dettaglio (dettagli)       
    			var oTicketId = sap.n.oTicketId;
			    var listDetailTicket = this.getView().byId("__component0---TicketDetail--listDetailTicket");
			    var oFilterByTicketId = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, oTicketId);
		      	listDetailTicket.getBinding("items").filter(oFilterByTicketId);
    	    }
		},
		
		
		//slider per lo zoom degli screenshot nella pagina di dettaglio
		onSliderMoved: function (oEvent) {
			var origingalHeight = 650;

			var screenSizesJSON = this.getView().getModel("ScreenSizesModel").getData();
			var iValue = oEvent.getParameter("value");
			var screenWidth = screenSizesJSON.screenSizes[Number(iValue) - 1];
			var oCarouselContainer = this.getView().byId("screenshot1");
			oCarouselContainer.setWidth(screenWidth);
			var screenHeight = origingalHeight * parseFloat(screenWidth) / 1000;
			oCarouselContainer.setHeight(screenHeight + 'px');
		},
		
		onSliderMoved2: function (oEvent) {
			var origingalHeight = 650;

			var screenSizesJSON = this.getView().getModel("ScreenSizesModel").getData();
			var iValue = oEvent.getParameter("value");
			var screenWidth = screenSizesJSON.screenSizes[Number(iValue) - 1];
			var oCarouselContainer = this.getView().byId("screenshot");
			oCarouselContainer.setWidth(screenWidth);
			var screenHeight = origingalHeight * parseFloat(screenWidth) / 1000;
			oCarouselContainer.setHeight(screenHeight + 'px');
		},
		
		onFilterTicketScreenshot: function () {
			
			//Filtra il ticket selezionato nella tabella e produce4 i risultati nella pagina di dettaglio (screenshot pagina dettaglio)
			if (sap.n.oTicketId) {
					var oTicketId = sap.n.oTicketId;
				    var listDetailTicket = this.getView().byId("__component0---TicketDetail--screenshot");
				    var oFilterByTicketId = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, oTicketId);
			      	listDetailTicket.getBinding("pages").filter(oFilterByTicketId);
       	    }
		},
		
		onFilterTicketScreenshot1: function () {
		
			if (sap.n.oTicketId) {
        		//Filtra il ticket selezionato nella tabella e produce4 i risultati nella pagina di dettaglio (screenshot pagina chat)     
	    		var oTicketId = sap.n.oTicketId;
				var listDetailTicket = this.getView().byId("__component0---TicketDetail--screenshot1");
				var oFilterByTicketId = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, oTicketId);
			    listDetailTicket.getBinding("pages").filter(oFilterByTicketId);

			}
		},
	
		
		onFilterTicketChat: function () {
		
			if (sap.n.oChatId===sap.n.oTicketId) {
				
        		//Filtra il ticket selezionato nella tabella e produce4 i risultati nella pagina di dettaglio (chatlist)
        		var oChatId = sap.n.oChatId;
			    var listDetailTicket = this.getView().byId("__component0---TicketDetail--ChatList");
			    var oFilterByTicketId = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, oChatId);
		      	listDetailTicket.getBinding("items").filter(oFilterByTicketId);
    	    }
			
		},
		
		_onPageNavButtonPress: function() {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}
		},
		
		getQueryParameters: function(oLocation) {

			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onFeedInputPost: function() {
			return new Promise(function(fnResolve) {
				var sTargetPos = "default";
				sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
				sap.m.MessageToast.show("Messaggio inviato", {
					onClose: fnResolve,
					duration: 3000 || 3000,
					at: sTargetPos,
					my: sTargetPos
				});
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRatingIndicatorChange: function() {
			return new Promise(function(fnResolve) {
				var sTargetPos = "default";
				sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
				sap.m.MessageToast.show("Hai valutato il servizio", {
					onClose: fnResolve,
					duration: 3000 || 3000,
					at: sTargetPos,
					my: sTargetPos
				});
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress3: function(oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function(fnResolve) {
					fnResolve(true);
				})
				.then(function(result) {

					var oBindingContext = oEvent.getSource().getBindingContext();

					return new Promise(function(fnResolve) {

						this.doNavigate("ListaTicket", oBindingContext, fnResolve, "");
					}.bind(this));

				}.bind(this))
				.then(function(result) {
					if (result === false) {
						return false;
					} else {
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

					}
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
		}
	});
}, /* bExport= */ true);