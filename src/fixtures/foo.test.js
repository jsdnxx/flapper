/* eslint-env mocha */
// @flow
import Foo from './foo'
import { assertPropertiesOfClass } from '../index'

assertPropertiesOfClass(Foo, './foo')
  .fullyAnnotated()
  .constructorAssignsProps()
