sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"jquery.sap.global"], 
	
	function(BaseController, MessageBox, Utilities, History, UploadCollectionParameter, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.ticketManagement.controller.NewTicket", {
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
	
	
		onChange : function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name : "x-csrf-token",
				value : "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			MessageToast.show("File aggiunto correttamente");
		},

		onFilenameLengthExceed : function(oEvent) {
			MessageToast.show("Il nome attribuito al file è troppo lungo (max 60 caratteri)");
		},

		onTypeMissmatch : function(oEvent) {
			MessageToast.show("Il formato file inserito non è supportato");
		},
	
		// Upload del ticket appena inserito dall'utente	
		onStartUpload : function(oEvent) {
			
			var oUploadCollection = this.getView().byId("UploadCollection");
			var cFiles = oUploadCollection.getItems().length;
			oUploadCollection.upload();
			
		
		},

		onBeforeUploadStarts : function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name : "slug",
				value : oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			
			setTimeout(function() {
				MessageToast.show("Upload ticket in corso");
			}, 4000);
		},

		onUploadComplete : function(oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function() {
				var oUploadCollection = this.getView().byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}

				// delay the success message in order to see other messages before
				MessageToast.show("Upload ticket completato");
			}.bind(this), 8000);
			
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("HomeUser", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		onSelectChange : function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
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
		_onButtonPress6: function(oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function(fnResolve) {
					fnResolve(true);
				})
				.then(function(result) {
					return new Promise(function(fnResolve) {
						var aChangedEntitiesPath, oChangedBindingContext;
						var oModel = this.oModel;
						if (oModel && oModel.hasPendingChanges()) {
							aChangedEntitiesPath = Object.keys(oModel.mChangedEntities);

							for (var j = 0; j < aChangedEntitiesPath.length; j++) {
								oChangedBindingContext = oModel.getContext("/" + aChangedEntitiesPath[j]);
								if (oChangedBindingContext && oChangedBindingContext.bCreated) {
									oModel.deleteCreatedEntry(oChangedBindingContext);
								}
							}
							oModel.resetChanges();
						}
						fnResolve();
					}.bind(this));

				}.bind(this))
				.then(function(result) {
					if (result === false) {
						return false;
					} else {

						var oHistory = History.getInstance();
						var sPreviousHash = oHistory.getPreviousHash();
						var oQueryParams = this.getQueryParameters(window.location);

						if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
							window.history.go(-1);
						} else {
							var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
							oRouter.navTo("default", true);
						}
					}
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
		},
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("NewTicket").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.oModel = this.getOwnerComponent().getModel();

		}
	});
}, /* bExport= */ true);