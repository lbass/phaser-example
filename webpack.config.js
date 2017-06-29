var path = require('path');

module.exports = {
  entry: ['./src/striketowers/app.js',
          './src/striketowers/Enemy.class.js'],
  devServer: {
    port: 8080,
    publicPath: '/',
    inline: true,
    contentBase: path.join(__dirname, '/')
  }
}
