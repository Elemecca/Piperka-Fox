
var piperka;
if (!piperka) piperka = {};

if (!piperka.treeView) (function(){
    /** @class Custom tree view for the Piperka sidebar.
     */
    piperka.treeView = function (model) {
        this.model = model;
    };
    var C = piperka.treeView.prototype = {};

    Object.defineProperty( C, 'rowCount', {
        get: function() {
            return this.model.count();
        }
    });
    
    /** Informs the model of the view it is to service.
     * @param {nsITreeBoxObject} tree the tree to be served
     */
    C.setTree = function (tree) {
        this.tree = tree;
    };

    /** Gets the text contents of the given cell.
     * @param {number} row the zero-based index of the cell's row
     * @param {nsITreeColumn} col the cell's column object
     * @return {string} the textual contents of the cell
     */
    C.getCellText = function (row, col) {
        var comic = this.model.getComicByNameIndex( row );
        if (null == comic) return null;
        return comic[ col.id ];
    };

    /** Gets the image contents of the given cell.
     * @param {number} row the zero-based index of the cell's row
     * @param {nsITreeColumn} col the cell's column object
     * @return {string} the URL of the image contents of the cell
     */
    C.getImageSrc = function (row, col) {
        if (col.id != 'name') return null;
        return 'chrome://piperka/skin/icon-16.png';
    };

    /** Gets the indentation depth of a row.
     * @param {number} row the zero-based index of the row to query
     * @return {number} how many levels the row should be indented
     */
    C.getLevel = function (row) {
        // for now the tree is flat
        return 0;
    }

    /** Checks whether a row can have children.
     * @param {number} row the zero-based index of the row to query
     * @return {boolean} whether the row is a container
     */
    C.isContainer = function (row) {
        // for now the tree is flat
        return false;
    };

    /** Checks whether a row is a separator.
     * @param {number} row the zero-based index of the row to query
     * @return {boolean} whether the row is a separator
     */
    C.isSeparator = function (row) {
        return false;
    };

    /** Checks whether the model is sorted.
     * @return {boolean} whether the model is sorted on a column
     */
    C.isSorted = function() {
        return false;
    }

    C.getRowProperties = function (row, props) { return props; };
    C.getColumnProperties = function (col, props) { return props; };
    C.getCellProperties = function (row, col, props) { return props; };

})();
