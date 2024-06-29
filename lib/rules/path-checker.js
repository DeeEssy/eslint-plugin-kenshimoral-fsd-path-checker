"use strict";

const path = require('path');

module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "FSD relative paths checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: {
      relativePathViolation: "Only relative paths allowed inside slices"
    }, // Add messageId and message
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        // example src\entities\Article
        const importTo = node.source.value;

        // example E:\Projects\production-project\src\entities\Article
        const currentFilename = context.getFilename();

        if(shouldBeRelative(currentFilename, importTo)) {
          context.report({node: node, messageId: 'relativePathViolation'});
        }
      }
    };
  },
};

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../')
}

const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
}

function shouldBeRelative(from, to) {
  if(isPathRelative(to)) {
    return false;
  }

  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split('src')[1];
  const fromArray = projectFrom.split('\\')

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}