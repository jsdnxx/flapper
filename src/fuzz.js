// @flow
import { invariant } from './util'
import type { Node } from './util' // eslint-disable-line

export function fuzzFor (typeAnnotation: Node): any {
  invariant(typeAnnotation.type === 'TypeAnnotation', `${typeAnnotation.type} must be a TypeAnnotation`)
  switch (typeAnnotation.typeAnnotation.type) {
    case 'StringTypeAnnotation':
      return 'foobarbaz' // todo better generators
  }
  invariant(0, `type ${typeAnnotation.typeAnnotation.type} not supported`)
}
