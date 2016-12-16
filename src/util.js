// @flow
export type Node = {
  type: string
} & Object

export const EmptyNode: Node = {type: 'EmptyNode'}

// fix return type
export function flatMap<T, T2> (arr: Array<T>, fn: (x:T) => T2): any {
  return arr.map(fn).reduce((acc, arr2) => acc.concat(arr2), [])
}

export function invariant (predicate: boolean, msg: string): void {
  if (!predicate) {
    throw new Error(`Invariant violation: ${msg}`)
  }
}

export function displayName (node: Node): string {
  switch (node.type) {
    case 'Identifier':
      return node.name
  }
  invariant(0, `${node.type} not supported`)
  return '' // https://github.com/facebook/flow/issues/3032
}
