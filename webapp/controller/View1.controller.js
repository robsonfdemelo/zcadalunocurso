sap.ui.define([
    "zcadalunocurso/controller/App.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/m/MessagePopover",
    'sap/ui/table/Column',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/Filter",
    "sap/m/MessageItem"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MLibrary, MessagePopover, UIColumn, FilterOperator, Filter, MessageItem,) {
        "use strict";

        var oMessagePopover;

        return Controller.extend("zcadalunocurso.controller.View1", {
            onInit: function () {
                this.criaModeloAuxiliar()
            },

            onValueHelpUser: function () {

                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "zcadalunocurso.view.fragmentos.ValueHelpUser"
                    });
                }
                this.pDialog.then(function (oDialog) {
                    var oFilterBar = oDialog.getFilterBar();
                    this._oVHD = oDialog;
                    if (this._bDialogInitialized) {
                        oDialog.open();
                        return;
                    }
                    this.getView().addDependent(oDialog);
                    oFilterBar.setFilterBarExpanded(true);
                    oDialog.getTableAsync().then(function (oTable) {

                        oTable.setModel(this.oProductsModel);
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", {
                                path: "/ZshHelpCursosRfmSet",
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new UIColumn({ label: "IdCurso", template: "IdCurso" }));
                            oTable.addColumn(new UIColumn({ label: "NomeCurso", template: "NomeCurso" }));
                            oTable.addColumn(new UIColumn({ label: "Duracao", template: "Duracao" }));
                        }

                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", {
                                path: "/ZshHelpCursosRfmSet",
                                template: new ColumnListItem({
                                    cells: [new Label({ text: "{IdCurso}" }), new Label({ text: "{NomeCurso}" }), new Label({ text: "{Duracao}" })]
                                }),
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new MColumn({ header: new Label({ text: "IdCurso" }) }));
                            oTable.addColumn(new MColumn({ header: new Label({ text: "NomeCurso" }) }));
                            oTable.addColumn(new MColumn({ header: new Label({ text: "Duracao" }) }));
                        }
                        oDialog.update();
                    }.bind(this));

                    // set flag that the dialog is initialized
                    this._bDialogInitialized = true;
                    oDialog.open();
                }.bind(this));
            },

            onFilterBarSearchUserA: function (oEvent) {
                var aSelectionSet = oEvent.getParameter("selectionSet");

                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: FilterOperator.Contains,
                            value1: oControl.getValue()
                        }));
                    }

                    return aResult;
                }, []);


                this._filterTableA(new Filter({
                    filters: aFilters,
                    and: true
                }));
            },

            _filterTableA: function (oFilter) {
                var oVHD = this._oVHD;

                oVHD.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }
                    oVHD.update();
                });
            },

            onValueHelpOkPressA: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                var sUser = aTokens[0].getProperty("key");
                this._user = this.byId("idUserHelp");
                this._user.setValue(sUser);
                this._oVHD.close();
            },

            onValueHelpCancelPressA: function (oEvent) {
                this._oVHD.close();
            },

            criaModeloAuxiliar: function () {
                let oModel = new JSONModel()
                let objeto = {
                    Menssagens: [],
                    Editable: false
                }

                oModel.setData(objeto)
                this.getView().setModel(oModel, "Auxiliar")

                this.AlimentaModeloMenssagens()
            },

            AlimentaModeloMenssagens: function () {
                let oMessageTemplate = new MessageItem({
                    type: '{Auxiliar>type}',
                    title: '{Auxiliar>title}',
                    activeTitle: "{Auxiliar>active}",
                    description: '{Auxiliar>description}',
                    subtitle: '{Auxiliar>subtitle}',
                    counter: '{Auxiliar>counter}'
                });

                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'Auxiliar>/Menssagens',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {

                    }
                });

                var messagePopoverBtn = this.byId("messagePopoverBtn");

                if (messagePopoverBtn) {
                    this.byId("messagePopoverBtn").addDependent(oMessagePopover);
                }
            },
            onDeletaCurso: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedContextPaths()
                if (selecionados.length > 0) {
                    sap.m.MessageBox.alert("Confirma a exclusão de todos os cursos selecionados?", {
                        actions: ["Sim", "Não"],
                        onClose: function (sAction) {
                            if (sAction == "Sim") {
                                let Indice
                                for (let i = 0; i < selecionados.length; i++) {
                                    Indice = selecionados[i]
                                    oModel.remove(Indice, {
                                        success: function () {
                                            let arrayMsg = {
                                                type: "Success",
                                                title: "Curso excluido com sucesso",
                                                activeTitle: true,
                                                description: "O Curso com indice " + Indice + " foi excluido com sucesso!!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        },
                                        error: function () {
                                            let arrayMsg = {
                                                type: "Error",
                                                title: "Erro ao excluir o Curso",
                                                activeTitle: true,
                                                description: "Erro ao excluir o aluno com indice " + Indice + " !!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        }
                                    })
                                }
                            }
                        }
                    })
                } else {
                    sap.m.MessageBox.error("Selecione ao menos um aluno para exclusão!!!")
                }
            },

            onAdcionaCurso: function () {
                if (!this.adicionar) {
                    this.adicionar = sap.ui.xmlfragment("zcadalunocurso.view.fragmentos.AdicionarCurso", this);
                    this.getView().addDependent(this.adicionar);
                }
                this.adicionar.open();
            },

            onAddAluno: function () {
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedItems();
                if (selecionados.length == 0) {
                    sap.m.MessageBox.error("Selecione um Curso para o aluno!!!")
                } else {
                    let id = selecionados[0].mAggregations.cells[0].getProperty("text")
                    this.getRouter().navTo("RouteDetalheAluno", {
                        id
                    });
                }
            },

            listaAlunos: function () {

                let id = "Lista de Alunos";
                this.getRouter().navTo("RouteAlunos", {
                    id
                });

            },


            CancelarAdicionar: function () {
                this.adicionar.close();
            },

            GravaAdicionarCurso: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let IdCurso = this.adicionar.mAggregations.content[0].getValue()
                let NomeCurso = this.adicionar.mAggregations.content[1].getValue()
                let Duracao = this.adicionar.mAggregations.content[2].getValue()

                var oDados = {
                    "IdCurso": IdCurso
                }

                this.getView().getModel().callFunction('/GetIDExist', {
                    method: "GET",
                    urlParameters: oDados,
                    success: function (oData, oReponse) {
                        if (!oReponse.data.OK) {
                            sap.m.MessageBox.alert("Confirma a inclusão do Curso?", {
                                actions: ["Sim", "Não"],
                                onClose: function (sAction) {
                                    if (sAction == "Sim") {
                                        let objeto = {
                                            IdCurso: IdCurso,
                                            NomeCurso: NomeCurso,
                                            Duracao: Duracao,
                                        }
                                        oModel.create('/CadCursosSet', objeto, {
                                            success: function (oData, oReponse) {
                                                let arrayMsg = {
                                                    type: "Success",
                                                    title: "Curso incluido com sucesso !!!",
                                                    activeTitle: true,
                                                    description: "O Curso " + IdCurso + " foi incluido com sucesso!!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                                that.CancelarAdicionar()
                                            },
                                            error: function (oError) {
                                                let arrayMsg = {
                                                    type: "Error",
                                                    title: "Erro ao incluir Curso !!!",
                                                    activeTitle: true,
                                                    description: "Erro ao incluir o Curso " + idCurso + " !!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                            }
                                        });
                                    }
                                }
                            })
                        } else {
                            sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("msgErroAlunoExist"));
                        }
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("lblMsgCreateError"));
                    }
                });


            },

            handleMessagePopoverPress: function () {
                oMessagePopover.openBy(this.getView().byId("messagePopoverBtn"));
            },

            onEditCurso: function () {
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedItems();
                if (selecionados.length == 0) {
                    sap.m.MessageBox.error("Nenhum Registro Selecionado!!!")
                } else if (selecionados.length > 0) {
                    if (selecionados.length > 1) {
                        sap.m.MessageBox.error("Só poderá ser editado um registro por vez !!!")
                    } else {
                        let id = selecionados[0].mAggregations.cells[0].getProperty("text")

                        this.getRouter().navTo("RouteDetalhe", {
                            id
                        });
                    }
                }
            },
        });
    });
