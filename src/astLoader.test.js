/* eslint-env mocha */
// @flow
import { expect } from 'chai'
// $FlowFixMe
import ast from './fixtures/foo.ast.json'
import { exported } from './astLoader'

describe('exports', () => {
  it('gets map of exported things', () => {
    expect(Object.keys(exported(ast)))
      .to.deep.equal(['Locale', 'default'])
  })
})
