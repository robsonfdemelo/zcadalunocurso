sap.ui.define([
    "zcadalunocurso/controller/App.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("zcadalunocurso.controller.Detalhe", {
            onInit: function () {
                this.getRouter().getRoute("RouteDetalhe").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                let ModeloAuxiliar = new JSONModel()
                let objeto = {
                    editable: false,
                    visibleEdit: true,
                    visibleSave: false
                }
                ModeloAuxiliar.setData(objeto)
                this.getView().setModel(ModeloAuxiliar, "Auxiliar")

                let id = oEvent.getParameter("arguments").id;

                this.getModel().refresh()
                this.getModel().metadataLoaded().then(function () {
                    var sObjectPath = this.getModel().createKey("CadCursosSet", {
                        IdCurso: id
                    });
                    this._bindView("/" + sObjectPath);
                }.bind(this));

            },

            _bindView: function (sObjectPath) {
                var oViewModel = this.getView().getModel();
                var that = this;
                oViewModel.setProperty("/busy", false);
                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function () {
                            oViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            oViewModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            _onBindingChange: function () {
                var oView = this.getView(),
                    oElementBinding = oView.getElementBinding();

                if (!oElementBinding.getBoundContext()) {
                    return;
                }

            },

            onEditaCurso: function () {
                let oModel = this.getView().getModel("Auxiliar")
                let oData = oModel.getData()

                oData.editable = true
                oData.visibleEdit = false,
                    oData.visibleSave = true
                oModel.refresh()
            },

            onCancelaCurso: function () {
                let oModel = this.getView().getModel()
                oModel.refresh()

                let that = this
                sap.m.MessageBox.alert("Confirma o cancelamento da edição?", {
                    actions: ["Sim", "Não"],
                    onClose: function (sAction) {
                        let oModelAuxiliar = that.getView().getModel("Auxiliar")
                        let oData = oModelAuxiliar.getData()

                        oData.editable = false
                        oData.visibleEdit = true
                        oData.visibleSave = false
                        oModelAuxiliar.refresh()
                    }
                })

            },

            onSalvaCurso: function () {
                let IdCurso = this.getView().byId("IdCurso").getValue()
                let NomeCurso = this.getView().byId("NomeCurso").getValue()
                let Duracao = this.getView().byId("Duracao").getValue()
                let that = this
                let chave = this.getView().byId("IdCurso").getValue()

                let objeto = {
                    IdCurso: IdCurso,
                    NomeCurso: NomeCurso,
                    Duracao: Duracao,
                }

                this.getView().getModel().update("/CadCursosSet('" + chave + "')", objeto, {
                    success: function (oData, oReponse) {
                        sap.m.MessageBox.success("Curso atualizado com sucesso!!!", {
                            actions: ["Ok"],
                            onClose: function (sAction) {
                                that.onCancelaCurso()
                                that.getRouter().navTo("RouteView1")
                            }
                        })

                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Erro ao atualizar o Curso !!!");
                    }
                });
            },
        });
    });
