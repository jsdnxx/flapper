// @flow
import { EmptyNode, invariant, flatMap } from './util'
import type { Node } from './util' // eslint-disable-line
import { load } from './astLoader'

export function typeOf (node: Node): Node {
  switch (node.type) {
    case 'Import':
      // todo: extract loader stuff
      return load(node)
    case 'ClassProperty':
      invariant(node.typeAnnotation && node.typeAnnotation.type === 'TypeAnnotation', `property ${node.key.name} missing type annotation`)
      return node.typeAnnotation
    case 'Identifier':
      invariant(node.typeAnnotation && node.typeAnnotation.type === 'TypeAnnotation', `identifier ${node.name} missing type annotation`)
      return node.typeAnnotation
  }
  invariant(0, `typeOf<${node.type}>() not supported`)
  return EmptyNode
}

export function paramsOf (node: Node) : Array<Node> {
  switch (node.type) {
    case 'MethodDefinition':
      return paramsOf(node.value)
    case 'FunctionExpression':
      return flatMap(node.params, paramsOf)
    case 'Identifier':
      return [node]
    case 'AssignmentPattern':
      invariant(node.left && node.left.type === 'Identifier', `must assign to identifier at ${JSON.stringify(node.loc)}`)
      return [node.left]
    default:
      console.log(node)
      invariant(0, node.type)
      return []
  }
}

export function findClassConstructorNode (classDeclaration: Node): Node {
  invariant(classDeclaration.type === 'ClassDeclaration', 'Must be ClassDeclaration')
  return classDeclaration.body.body.find(node => node.type === 'MethodDefinition' && node.kind === 'constructor')
}

export function findClassProperties (classDeclaration: Node) : Node[] {
  invariant(classDeclaration.type === 'ClassDeclaration', 'Must be ClassDeclaration')
  return classDeclaration.body.body.filter(node => node.type === 'ClassProperty')
}

export function findClassMethods (classDeclaration: Node) : Node[] {
  invariant(classDeclaration.type === 'ClassDeclaration', 'Must be ClassDeclaration')
  return classDeclaration.body.body.filter(node => node.type === 'MethodDefinition' && node.kind === 'method')
}
