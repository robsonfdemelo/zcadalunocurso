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

        return Controller.extend("zcadalunocurso.controller.View1Alunos", {
            onInit: function () {
                this.getRouter().getRoute("RouteAlunos").attachPatternMatched(this._onObjectMatched, this);
                this.criaModeloAuxiliar()
            },

            onValueHelpAlunos: function () {

                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "zcadalunocurso.view.fragmentos.ValueHelpAlunos"
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
                                path: "/ZshHelpAlunosRfmSet",
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new UIColumn({ label: "IdCurso", template: "IdCurso" }));
                            oTable.addColumn(new UIColumn({ label: "AlunoId", template: "AlunoId" }));
                            oTable.addColumn(new UIColumn({ label: "NomeAluno", template: "NomeAluno" }));
                            oTable.addColumn(new UIColumn({ label: "Ativo", template: "Ativo" }));
                        }

                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", {
                                path: "/ZshHelpAlunosRfmSet",
                                template: new ColumnListItem({
                                    cells: [new Label({ text: "{IdCurso}" }), new Label({ text: "{AlunoId}" }), new Label({ text: "{NomeAluno}" }), new Label({ text: "{Ativo}" })]
                                }),
                                events: {
                                    dataReceived: function () {
                                        oDialog.update();
                                    }
                                }
                            });
                            oTable.addColumn(new UIColumn({ label: "Id_Curso", template: "IdCurso" }));
                            oTable.addColumn(new UIColumn({ label: "Aluno_Id", template: "Aluno_Id" }));
                            oTable.addColumn(new UIColumn({ label: "Nome_Aluno", template: "Nome_Aluno" }));
                            oTable.addColumn(new UIColumn({ label: "Ativo", template: "Ativo" }));
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
            onDeletaAluno: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar")
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedContextPaths()
                if (selecionados.length > 0) {
                    sap.m.MessageBox.alert("Confirma a exclusão de todos os alunos selecionados?", {
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
                                                title: "Aluno excluido com sucesso",
                                                activeTitle: true,
                                                description: "O aluno com indice " + Indice + " foi excluido com sucesso!!!",
                                            }
                                            oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                            oModelAuxiliar.refresh(true);

                                            that.byId("messagePopoverBtn").setType("Accept");
                                            oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                        },
                                        error: function () {
                                            let arrayMsg = {
                                                type: "Error",
                                                title: "Erro ao excluir o aluno",
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

            onAdcionaAluno: function () {
                if (!this.adicionar) {
                    this.adicionar = sap.ui.xmlfragment("zcadalunocurso.view.fragmentos.AdicionarAluno", this);
                    this.getView().addDependent(this.adicionar);
                }
                this.adicionar.open();
            },

            CancelarAdicionarAluno: function () {
                this.adicionar.close();
            },

            GravaAdicionarAluno: function () {
                let that = this
                let oModel = this.getView().getModel()
                let oModelAuxiliar = this.getView().getModel("Auxiliar");
                let IdCurso = this.adicionar.mAggregations.content[0].getValue()
                let Aluno_id = this.adicionar.mAggregations.content[1].getValue()
                let NomeAluno = this.adicionar.mAggregations.content[2].getValue()
                //let Ativo = this.adicionar.mAggregations.content[3].getValue() ? "X" : '';

                var oDados = {
                    "Aluno_Id": Aluno_id
                }

                this.getView().getModel().callFunction('/GetIDExistAluno', {
                    method: "GET",
                    urlParameters: oDados,
                    success: function (oData, oReponse) {
                        if (!oReponse.data.OK) {
                            sap.m.MessageBox.alert("Confirma a inclusão do Aluno?", {
                                actions: ["Sim", "Não"],
                                onClose: function (sAction) {
                                    if (sAction == "Sim") {
                                        let objeto = {
                                            IdCurso: IdCurso,
                                            Aluno_id: Aluno_id,
                                            NomeAluno: NomeAluno
                                            //Ativo: Ativo
                                        }
                                        oModel.create('/CadAlunosSet', objeto, {
                                            success: function (oData, oReponse) {
                                                let arrayMsg = {
                                                    type: "Success",
                                                    title: "Aluno incluido com sucesso !!!",
                                                    activeTitle: true,
                                                    description: "O Aluno " + Aluno_id + " foi incluido com sucesso!!!",
                                                }
                                                oModelAuxiliar.oData.Menssagens.push(arrayMsg);
                                                oModelAuxiliar.refresh(true);

                                                that.byId("messagePopoverBtn").setType("Accept");
                                                oMessagePopover.openBy(that.getView().byId("messagePopoverBtn"));
                                                let id = "Novo Aluno";

                                                that.getRouter().navTo("RouteAlunos", {
                                                    id
                                                });
                                                that.CancelarAdicionarAluno()
                                            },
                                            error: function (oError) {
                                                let arrayMsg = {
                                                    type: "Error",
                                                    title: "Erro ao incluir Aluno !!!",
                                                    activeTitle: true,
                                                    description: "Erro ao incluir o A " + Aluno_Id + " !!!",
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

            onValueHelpCancelPressA: function (oEvent) {
                this._oVHD.close();
            },

            handleMessagePopoverPress: function () {
                oMessagePopover.openBy(this.getView().byId("messagePopoverBtn"));
            },

            onEditAluno: function () {
                let Table = this.getView().byId("idTable")
                let selecionados = Table.getSelectedItems();
                if (selecionados.length == 0) {
                    sap.m.MessageBox.error("Nenhum Registro Selecionado!!!")
                } else if (selecionados.length > 0) {
                    if (selecionados.length > 1) {
                        sap.m.MessageBox.error("Só poderá ser editado um registro por vez !!!")
                    } else {
                        let id = selecionados[0].mAggregations.cells[0].getProperty("text")

                        this.getRouter().navTo("RouteDetalheAluno", {
                            id
                        });
                    }
                }
            },
        });
    });
