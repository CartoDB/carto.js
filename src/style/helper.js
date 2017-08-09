var postcss = require('postcss');
var stripInlineComments = require('postcss-strip-inline-comments');
var SCSSsyntax = require('postcss-scss');

function generateCSSTreeFromCartoCSS (cartocss) {
  return postcss()
    .use(stripInlineComments)
    .process(cartocss, { syntax: SCSSsyntax });
}

module.exports = {
  getValueFromAttribute: function (treeOrCSS, attributeName) {
    if (!treeOrCSS) throw new Error('cartocss or cssTree is required');

    var CSSTree = typeof treeOrCss === 'string' ? generateCSSTreeFromCartoCSS(treeOrCSS) : treeOrCSS;
    var root = CSSTree.result.root;
    var attributeValue;

    if (root) {
      root.walkDecls(attributeName, function (decl) {
        var declValue = decl.value;
        if (declValue && declValue.search('@') === 0) {
          attributeValue = this.getValueFromVariable(CSSTree, declValue);
        } else {
          attributeValue = declValue;
        }
      }.bind(this));
    }

    return attributeValue;
  },

  getValueFromVariable: function (treeOrCSS, variableName) {
    if (!treeOrCSS) throw new Error('cartocss or cssTree is required');

    var CSSTree = typeof treeOrCss === 'string' ? generateCSSTreeFromCartoCSS(treeOrCSS) : treeOrCSS;
    var root = CSSTree.result.root;
    var ruleName = variableName.replace(/@/g, '') + ':';
    var value;

    if (root) {
      root.walkAtRules(ruleName, function (decl) {
        value = decl.params;
      });
    }

    return value;
  }
};
