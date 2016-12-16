/* eslint-env mocha */
// @flow
import { expect } from 'chai'
// $FlowFixMe
import ast from './fixtures/foo.ast.json'
import { findClassConstructorNode } from './navigation'

describe('findClassConstructorNode', () => {
  it('gets the class constructor node', () => {
    expect(findClassConstructorNode(ast.body[1].declaration))
      .to.equal(ast.body[1].declaration.body.body[1])
  })
})
