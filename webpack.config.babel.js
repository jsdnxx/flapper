export default {
  entry: './index.js',
  output: {
    path: './obj',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loaders: [
          'babel'
        ],
        include: './index.js'
      }
    ]
  }
}
