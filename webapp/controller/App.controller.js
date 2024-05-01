sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
  ],
  function (BaseController, MessageBox) {
    "use strict";

    return BaseController.extend("zcadalunocurso.controller.App", {
      onInit: function () {
      },

      onNavega: function (oEvent) {
        let id = oEvent.getSource().getBindingContext().sPath
        id = id.split("('")[1]
        id = id.split("')")[0]

        this.getRouter().navTo("RouteDetalhe", {
          id
        })
      },

      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      navButtonPressed: function () {
        window.history.back()
      },

      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

    });
  }
);
