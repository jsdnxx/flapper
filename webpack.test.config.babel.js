export default {
  entry: './test.js',
  output: {
    path: './obj',
    filename: 'test.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loaders: [
          'babel'
        ],
        include: './test.js'
      }
    ]
  }
}
