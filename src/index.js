// @flow

export type Locale =
  | 'en-US'
  | 'es-US'

export default class Foo {
  name: string

  constructor (name: string) {
    this.name = name
  }

  // $FlowFixMe
  greet (locale: Locale = 'en-US'): string {
    switch (locale) {
      case 'en-US':
        return `Hey there ${this.name}! What's up?`
      case 'es-US':
        return `¡Hola ${this.name}! ¿Cómo estás?`
    }
  }
}
