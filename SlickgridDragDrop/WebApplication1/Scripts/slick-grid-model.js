var SlickGridModel = function () {
    var grid, grid2;
    var data = [], data2 = [];
    var columns = [
      {
          id: "#",
          name: "",
          width: 97,
          behavior: "selectAndMove",
          selectable: false,
          resizable: false,
          cssClass: "cell-reorder dnd"
      },
      {
          id: "name",
          name: "Name",
          field: "name",
          width: 497,
          cssClass: "cell-title",
          editor: Slick.Editors.Text
      }
    ];
    var TaskNameFormatter = function (row, cell, value, columnDef, dataContext) {
        value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
        var idx = dataView.getIdxById(dataContext.id);
        if (data2[idx + 1] && data2[idx + 1].indent > data2[idx].indent) {
            if (dataContext._collapsed) {
                return spacer + " <span class='toggle expand'></span>&nbsp;" + value;
            } else {
                return spacer + " <span class='toggle collapse'></span>&nbsp;" + value;
            }
        } else {
            return spacer + " <span class='toggle'></span>&nbsp;" + value;
        }
    };
    var columns2 = [
      {
          id: "#",
          name: "",
          width: 97,
          behavior: "selectAndMove",
          selectable: false,
          resizable: false,
          cssClass: "cell-reorder dnd"
      },
      {
          id: "name",
          name: "Name",
          field: "name",
          width: 497,
          cssClass: "cell-title",
          formatter: Slick.Formatters.Multiformatter,
          multiFormatter: [
              TaskNameFormatter,
              function (row, cell, value, columnDef, dataContext) {
                  var idx = dataView.getIdxById(dataContext.id);
                  if ((data2[idx + 1] && data2[idx + 1].indent > data2[idx].indent) || !data2[idx].indent) {
                      return '<div class="parentRow" data-row="' + row + '" >' + value + '</div>';
                  }
                  else {
                      return '<div data-row="' + row + '">' + value + '</div>';
                  }
              }
          ],
          editor: Slick.Editors.Text
      }
    ];
    var options = {
        editable: true,
        enableCellNavigation: true,
        forceFitColumns: true,
        autoEdit: false
    };
    data = [
      { id: 'id10', name: "Make a list" },
      { id: 'id11', name: "Check it twice" },
      { id: 'id12', name: "Find out what's not working" },
      { id: 'id14', name: "Find out what's working" },
      { id: 'id15', name: "Pick up a task" },
      { id: 'id16', name: "Review a task" },
      { id: 'id17', name: "Test a task" }
    ];
    var indent = 0;
    var parents = [];
    for (var i = 0; i < 50; i++) {
        var d = (data2[i] = {});
        var parent;

        if (Math.random() > 0.8 && i > 0) {
            indent++;
            parents.push(i - 1);
        } else if (Math.random() < 0.3 && indent > 0) {
            indent--;
            parents.pop();
        }

        if (parents.length > 0) {
            parent = parents[parents.length - 1];
        } else {
            parent = null;
        }

        d["id"] = "id_" + i;
        d["indent"] = indent;
        d["parent"] = parent;
        d["name"] = "Task " + i;
    };
    var myFilter = function (item) {
        if (item.parent != null) {
            var parent = data2[item.parent];

            while (parent) {
                if (parent._collapsed) {
                    return false;
                }

                parent = data2[parent.parent];
            }
        }

        return true;
    };
    var dataView = new Slick.Data.DataView();
    dataView.beginUpdate();
    dataView.setItems(data2);
    dataView.setFilter(myFilter);
    dataView.endUpdate();
    grid = new Slick.Grid("#myGrid", data, columns, options);
    grid2 = new Slick.Grid("#myGrid2", dataView, columns2, options);
    grid.setSelectionModel(new Slick.RowSelectionModel());
    grid2.setSelectionModel(new Slick.RowSelectionModel());
    grid2.onClick.subscribe(function (e, args) {
        if ($(e.target).hasClass("toggle")) {
            console.log('yes toggle')
            var item = dataView.getItem(args.row);
            if (item) {
                if (!item._collapsed) {
                    item._collapsed = true;
                } else {
                    item._collapsed = false;
                }

                dataView.updateItem(item.id, item);
            }
            e.stopImmediatePropagation();
        }
    });
    var moveRowsPlugin = new Slick.RowMoveManager({
        cancelEditOnDrag: true
    });
    moveRowsPlugin.onBeforeMoveRows.subscribe(function (e, data) {
        for (var i = 0; i < data.rows.length; i++) {
            // no point in moving before or after itself
            if (data.rows[i] == data.insertBefore || data.rows[i] == data.insertBefore - 1) {
                e.stopPropagation();
                return false;
            }
        }
        return true;
    });
    moveRowsPlugin.onMoveRows.subscribe(function (e, args) {
        var extractedRows = [], left, right;
        var rows = args.rows;
        var insertBefore = args.insertBefore;
        left = data.slice(0, insertBefore);
        right = data.slice(insertBefore, data.length);
        rows.sort(function (a, b) { return a - b; });
        for (var i = 0; i < rows.length; i++) {
            extractedRows.push(data[rows[i]]);
        }
        rows.reverse();
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row < insertBefore) {
                left.splice(row, 1);
            } else {
                right.splice(row - insertBefore, 1);
            }
        }
        data = left.concat(extractedRows.concat(right));
        var selectedRows = [];
        for (var i = 0; i < rows.length; i++)
            selectedRows.push(left.length + i);
        grid.resetActiveCell();
        grid.setData(data);
        grid.setSelectedRows(selectedRows);
        grid.render();
    });
    grid.registerPlugin(moveRowsPlugin);
    var moveRowsPlugin2 = new Slick.RowMoveManager({
        cancelEditOnDrag: true
    });
    moveRowsPlugin2.onBeforeMoveRows.subscribe(function (e, data) {
        for (var i = 0; i < data.rows.length; i++) {
            // no point in moving before or after itself
            if (data.rows[i] == data.insertBefore || data.rows[i] == data.insertBefore - 1) {
                e.stopPropagation();
                return false;
            }
        }
        return true;
    });
    moveRowsPlugin2.onMoveRows.subscribe(function (e, args) {
        var extractedRows = [], left, right;
        var rows = args.rows;
        var insertBefore = args.insertBefore;
        left = data2.slice(0, insertBefore);
        right = data2.slice(insertBefore, data2.length);
        rows.sort(function (a, b) { return a - b; });
        for (var i = 0; i < rows.length; i++) {
            extractedRows.push(data2[rows[i]]);
        }

        rows.reverse();
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row < insertBefore) {
                left.splice(row, 1);
            } else {
                right.splice(row - insertBefore, 1);
            }
        }

        data2 = left.concat(extractedRows.concat(right));
        var selectedRows = [];
        for (var i = 0; i < rows.length; i++) {
            selectedRows.push(left.length + i);
        }

        grid2.resetActiveCell();
        grid2.setData(data2);
        grid2.setSelectedRows(selectedRows);
        grid2.render();
    });
    grid2.registerPlugin(moveRowsPlugin2);
    grid.onDragInit.subscribe(function (e, dd) {
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
    });
    grid.onDragStart.subscribe(function (e, dd) {
        var cell = grid.getCellFromEvent(e);
        dd.mode = 'dragRow';
        if (!cell) {
            return;
        }
        dd.row = cell.row;
        if (!data[dd.row]) {
            return;
        }
        if (Slick.GlobalEditorLock.isActive()) {
            return;
        }
        e.stopImmediatePropagation();
        var selectedRows = grid.getSelectedRows();
        if (!selectedRows.length || $.inArray(dd.row, selectedRows) == -1) {
            selectedRows = [dd.row];
            grid.setSelectedRows(selectedRows);
        }
        dd.rows = selectedRows;
        dd.count = selectedRows.length;
        var proxy = $("<span></span>")
            .css({
                position: "absolute",
                display: "inline-block",
                padding: "4px 10px",
                background: "#e0e0e0",
                border: "1px solid gray",
                "z-index": 99999,
                "-moz-border-radius": "8px",
                "-moz-box-shadow": "2px 2px 6px silver"
            })
            .text("Drag to grid to save " + dd.count + " selected row(s)")
            .appendTo("body");
        dd.helper = proxy;
        return proxy;
    });
    grid.onDrag.subscribe(function (e, dd) {
        if (dd.mode !== 'dragRow') {
            return;
        }

        dd.helper.css({ top: e.pageY + 5, left: e.pageX + 5 });
    });
    grid.onDragEnd.subscribe(function (e, dd) {
        if (dd.mode !== 'dragRow') {
            return;
        }

        dd.helper.remove();
    });
    $.drop({ mode: "mouse" });

    grid2.onDragInit.subscribe(function (e, dd) {
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
    });
    grid2.onCellChange.subscribe(function (e, args) {
        dataView.updateItem(args.item.id, args.item);
    });

    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid2.updateRowCount();
        grid2.render();
    });

    dataView.onRowsChanged.subscribe(function (e, args) {
        grid2.invalidateRows(args.rows);
        grid2.render();
    });
    var bindEvents = function () {
        $("#myGrid2 .grid-canvas")
            .on("dropstart", '.parentRow', function (e, dd) {
                if (dd.mode !== 'dragRow') {
                    return;
                }

                console.log('yellow');
            })
            .on("dropend", '.parentRow', function (e, dd) {
                if (dd.mode !== 'dragRow') {
                    return;
                }

                console.log('pink');
            })
            .on("drop", '.parentRow', function (e, dd) {
                if (dd.mode !== 'dragRow') {
                    return;
                }

                console.log("Drop in: " + dd.rows.toString());
                if (dd.rows.length > 0) {
                    var idx = $(this).data('row');
                    console.log('idx= ' + idx);
                    dd.rows.forEach(function (row) {
                        var item = dd.grid.getDataItem(row);
                        console.log('Working with ' + item.name);
                        var newRow = {
                            id: item.id + '_id_' + (idx + 1),
                            indent: data2[idx + 1].indent ? data2[idx + 1].indent : 1,
                            parent: idx,
                            name: item.name
                        };
                        dataView.insertItem(idx + 1, newRow);
                        bindEvents();
                        //data2.splice(idx + 1, 0, newRow);
                    });
                }

                //dataView.setItems(data2);
                //grid2.invalidate();
                var idsToRemove = [];
                dd.rows.forEach(function (row) {
                    idsToRemove.push(data[row].id);
                });
                idsToRemove.forEach(function (id) {
                    var idx = data.findIndex(function (item) {
                        return item.id === id;
                    });
                    if (idx > -1) {
                        data.splice(idx, 1);
                    }
                });
                grid.invalidate();
                dd.rows = [];
            });
    };
    grid.onAddNewRow.subscribe(function (e, args) {
        var item = { name: "New task", complete: false };
        $.extend(item, args.item);
        data.push(item);
        grid.invalidateRows([data.length - 1]);
        grid.updateRowCount();
        grid.render();
    });

    bindEvents();

}