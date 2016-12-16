// @flow
// todo: figure out how best to autodetect and generate flow ast for imports
// for now, json manually generated via `flow ast $(flow find-module './index' src/index.test.js)`
// $FlowFixMe
import ast from './fixtures/foo.ast.json'
import type { Node } from './util'

export function exported (ast: Node): {[name: string]: Object} {
  return ast.body.reduce((acc, node) => {
    if (node.type === 'ExportDefaultDeclaration') {
      return Object.assign(acc, {'default': node})
    } else if (node.type === 'ExportNamedDeclaration') {
      return Object.assign(acc, {[node.declaration.id.name]: node})
    } else {
      return acc
    }
  }, {})
}

function astOf (module, rel = __dirname) {
  return ast
}

export function load ({module, symbol}: Node): Node {
  return exported(astOf(module))[symbol].declaration
}
