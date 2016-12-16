/* eslint-env mocha */
// @flow
import { expect } from 'chai'
import Foo from './index'

function flatMap(arr, fn) {
  return arr.map(fn).reduce((acc, arr2) => acc.concat(arr2), [])
}

// todo: figure out how best to autodetect and generate flow ast for imports
// for now, json manually generated via `flow ast $(flow find-module './index' src/index.test.js)`
// $FlowFixMe
import ast from '../ast.json'

type Node = {
  type: string
} & Object

function invariant (predicate: boolean, msg: string): void {
  if (!predicate) {
    throw new Error(`Invariant violation: ${msg}`)
  }
}

function exports (ast: Node): {[name: string]: Object} {
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

function typeOf (node: {type: string} & Object): Node {
  switch (node.type) {
    case 'Import':
      return exports(astOf(node.module))[node.symbol].declaration
    case 'ClassProperty':
      invariant(node.typeAnnotation && node.typeAnnotation.type === 'TypeAnnotation', `property ${node.key.name} missing type annotation`)
      return node.typeAnnotation
    case 'Identifier':
      invariant(node.typeAnnotation && node.typeAnnotation.type === 'TypeAnnotation', `identifier ${node.name} missing type annotation`)
      return node.typeAnnotation
  }
  invariant(0, `typeOf<${node.type}>() not supported`)
}

function fuzzFor (typeAnnotation) {
  invariant(typeAnnotation.type === 'TypeAnnotation', `${typeAnnotation.type} must be a TypeAnnotation`)
  switch (typeAnnotation.typeAnnotation.type) {
    case 'StringTypeAnnotation':
      return 'foobarbaz' // todo better generators
  }
  invariant(0, `type ${typeAnnotation.typeAnnotation.type} not supported`)
}

function displayName (node): string {
  switch (node.type) {
    case 'Identifier':
      return node.name
  }
  invariant(0, `${node.type} not supported`)
}

function assertPropertiesOfClass (Klass, module, symbol = 'default') {
  const T = typeOf({type: 'Import', module, symbol})
  invariant(T.type === 'ClassDeclaration', `${symbol} must be a class`)
  const props = {
    constructorAssignsProps (...propNames: string[]) {
      props.constructorAnnotated()

      const constructor = findClassConstructorNode(T).value
      const classProps = findClassProperties(T)
      const params = paramsOf(constructor)
      if (propNames.length === 0) {
        propNames = classProps.map(prop => prop.key.name)
        .filter(propName => !propName.startsWith('_'))
      }
      const fuzzies = new Map()

      params.forEach(param => {
        const paramType = typeOf(param)
        const fuzz = fuzzFor(paramType)
        fuzzies.set(param, {paramType, fuzz})
      })

      const args = []
      fuzzies.forEach((val, key) => {
        args.push(val.fuzz)
        console.log(displayName(key), val.paramType.typeAnnotation, val.fuzz)
      })

      const instance = new Klass(...args)
      console.log('called with ', args, 'got instance', instance)

      propNames.forEach(propName => {
        invariant(instance[propName] !== undefined, `expected property '${propName}' to be set by constructor`)
      })

      console.log('ok')

      return props
    },
    constructorAnnotated () {
      const constructor = findClassConstructorNode(T)
      paramsOf(constructor).forEach(param => {
        invariant(param.typeAnnotation, `constructor parameter ${param.name} missing type annotation`)
      })

      return props
    },
    // all params and return type
    methodsAnnotated () {
      const methods = findClassMethods(T)
      methods.forEach(method => {
        invariant(method.value.returnType && method.value.returnType.type === 'TypeAnnotation', `${T.name}#${method.key.name}() missing return type annotation`)
        const params = paramsOf(method)
        params.forEach(param => {
          invariant(param.typeAnnotation, `${T.name}#${method.key.name}() param '${param.name}' missing type annotation`)
        })
      })

      return props
    },
    propsAnnotated () {
      const classProps = findClassProperties(T)
      classProps.forEach(classProp => {
        invariant(classProp.typeAnnotation, `${T.name}#${classProp.key.name} missing type annotation`)
      })
      return props
    },
    fullyAnnotated () {
      return props.constructorAnnotated()
        .propsAnnotated()
        .methodsAnnotated()
    }

  }
  return props
}

assertPropertiesOfClass(Foo, './index')
  .fullyAnnotated()
  .constructorAssignsProps()

function paramsOf (node: Node) : Node[] {
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

function findClassConstructorNode (classDeclaration: Node): Node {
  invariant(classDeclaration.type === 'ClassDeclaration', 'Must be ClassDeclaration')
  return classDeclaration.body.body.find(node => node.type === 'MethodDefinition' && node.kind === 'constructor')
}

function findClassProperties (classDeclaration: Node) : Node[] {
  invariant(classDeclaration.type === 'ClassDeclaration', 'Must be ClassDeclaration')
  return classDeclaration.body.body.filter(node => node.type === 'ClassProperty')
}

function findClassMethods (classDeclaration: Node) : Node[] {
  invariant(classDeclaration.type === 'ClassDeclaration', 'Must be ClassDeclaration')
  return classDeclaration.body.body.filter(node => node.type === 'MethodDefinition' && node.kind === 'method')
}

// describe('exports', () => {
//   it('gets map of exported things', () => {
//     // $FlowFixMe
//     expect(Object.keys(exports(ast)))
//       .to.deep.equal(['Locale', 'default'])
//   })
// })

// describe('findClassConstructorNode', () => {
//   it('gets the class constructor node', () => {
//     expect(findClassConstructorNode(ast.body[1].declaration))
//       .to.equal(ast.body[1].declaration.body.body[1])
//   })
// })
