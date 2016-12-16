/* globals Class */
// @flow

import { invariant, displayName } from './util'
import type { Node } from './util' // eslint-disable-line
import { fuzzFor } from './fuzz'
import {
  typeOf,
  findClassConstructorNode,
  findClassMethods,
  findClassProperties,
  paramsOf
} from './navigation'

export function assertPropertiesOfClass<ClassT> (Klass: Class<ClassT>, module: string, symbol: string = 'default') {
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

      // $FlowFixMe
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
