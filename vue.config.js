/* eslint-disable */
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const SVGSpriter = require('svg-sprite');
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

let pugData = {};

module.exports = {
  filenameHashing: false,
  runtimeCompiler: true,
  productionSourceMap: process.env.NODE_ENV !== 'production',
  css: {
    extract: true
  },
  transpileDependencies: [
    /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/,
  ],

  pages: {
    index: {
      entry: [
        'src/pages/Index/main.js',
        'src/pages/Index/main.scss',
      ],
      template: 'src/pages/Index/index.pug',
      filename: 'index.html',
      title: 'Главная',
    },

    measureList: {
      entry: [
        'src/pages/Measure-list/main.js',
        'src/pages/Measure-list/main.scss',
      ],
      template: 'src/pages/Measure-list/measure-list.pug',
      filename: 'measure-list.html',
      title: 'Единицы Измерения',
    },

    measureDetails: {
      entry: [
        'src/pages/Measure-details/main.js',
        'src/pages/Measure-details/main.scss',
      ],
      template: 'src/pages/Measure-details/measure-details.pug',
      filename: 'measure-details.html',
      title: 'Единицы Измерения',
    },

    valuesList: {
      entry: [
        'src/pages/Values-list/main.js',
        'src/pages/Values-list/main.scss',
      ],
      template: 'src/pages/Values-list/values-list.pug',
      filename: 'values-list.html',
      title: 'Список значений',
    },

    valuesDetails: {
      entry: [
        'src/pages/Values-details/main.js',
        'src/pages/Values-details/main.scss',
      ],
      template: 'src/pages/Values-details/values-details.pug',
      filename: 'values-details.html',
      title: 'Список значений',
    },

    characteristicsList: {
      entry: [
        'src/pages/Characteristics-list/main.js',
        'src/pages/Characteristics-list/main.scss',
      ],
      template: 'src/pages/Characteristics-list/characteristics-list.pug',
      filename: 'characteristics-list.html',
      title: 'Характеристики',
    },

    characteristicsDetails: {
      entry: [
        'src/pages/Characteristics-details/main.js',
        'src/pages/Characteristics-details/main.scss',
      ],
      template: 'src/pages/Characteristics-details/characteristics-details.pug',
      filename: 'characteristics-details.html',
      title: 'Характеристики',
    },
  },
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new CKEditorWebpackPlugin({
        language: 'ru'
      }),
      ...getHTMLWebpackPluginsToCompilePugs(),
      ...getSVGPlugin(),
      ...getStyleLintPlugin(),
    ],
  },
  chainWebpack: (...args) => {
    args[0].output.filename(process.env.NODE_ENV === 'production' ? 'js/[name].js' : 'js/[name].js').chunkFilename('js/[name].js');
    addRuleForVuePlusSVG.apply(null, args);
    addRuleForVuePlusDATA.apply(null, args);
    addRuleForVuePlusPugs.apply(null, args);
    addRuleForCKEditor.apply(null, args);
  },
};

function addRuleForVuePlusDATA() {
  const plugins = [];
  const svgIcons = [];
  const pages = [];
  try {
    const dataJson = fs.readFileSync('src/assets/data.js').toString();
    eval(dataJson);

    glob.sync('src/pages/**/*.pug').forEach((templatePath) => {
      const fileName = templatePath.split('/').pop();
      pages.push({
        href: fileName.replace('.pug', '.html'),
        name: fileName.replace('.pug', ''),
      });
    });
    fs.readdirSync('./src/assets/icons').forEach((fullName) => {
      const ext = path.extname(fullName);

      if (ext === '.svg') {
        svgIcons.push(fullName.slice(0, -ext.length));
      }
    });

    pugData = { ...data, ...{ svgIcons }, ...{ pages } };
    console.log('== DATA json add template pug! ==');

  } catch (e) {
    throw e;
  }
  return plugins;
}

function getSVGPlugin() {
  const plugins = [];
  const config = {
    dest: './dist/',
    mode: {
      symbol: true,
    },
  };
  try {
    const spriter = new SVGSpriter(config);
    const svgPaths = glob.sync('./src/assets/icons/*.svg', { absolute: true });

    svgPaths.forEach((svgPath) => {
      spriter.add(svgPath, null, fs.readFileSync(svgPath, { encoding: 'utf-8' }));
    });

    spriter.compile((error, result) => {
      const symbolSprite = result.symbol.sprite;
      fs.writeFileSync('./src/assets/sprite.svg', symbolSprite.contents);
      fs.writeFileSync('./public/sprite.svg', symbolSprite.contents);
      console.log('== SVG sprite created! ==');
    });
  } catch (e) {
    throw e;
  }
  return plugins;
}

// abstracted methods
function getHTMLWebpackPluginsToCompilePugs() {
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const plugins = [];
  try {
    glob.sync('src/*.pug').forEach((templatePath) => {
      const destPath = templatePath.replace('src/', '').replace('.pug', '.html');
      plugins.push(new HtmlWebpackPlugin({
        template: templatePath,
        filename: destPath,
        base: 'dist',
        inject: false,
        minify: false,
      }));
    });
  } catch (e) {
    throw e;
  }
  return plugins;
}

function addRuleForVuePlusPugs(webpackConfig) {
  const pugRule = webpackConfig.module.rule('pug');
  pugRule.uses.clear();
  pugRule
    .test(/\.pug$/)
    .oneOf('pug-vue')
    .resourceQuery(/^\?vue/)
    .use('pug-plain-loader')
    .end()
    .end()
    .oneOf('pug-template')
    .use('raw-loader')
    .loader('pug-html-loader')
    .options({
      data: { ...pugData },
    })
    .end()
    .end();
}

function addRuleForVuePlusSVG(webpackConfig) {
  const svgRule = webpackConfig.module.rule('svg-sprite');
  svgRule.uses.clear();

  // добавляем загрузчик для замены
  svgRule
    .test( /src[^/\\]+[/\\]assets[/\\]icons[/\\][^/\\]+\.svg$/ )
    .use('svgo-loader')
    .loader('svgo-loader');
}

function addRuleForCKEditor(config) {
  // (1.) To handle editor icons, get the default rule for *.svg files first:
  const svgRule = config.module.rule( 'svg' );

  // Then you can either:
  //
  // * clear all loaders for existing 'svg' rule:
  //
  //		svgRule.uses.clear();
  //
  // * or exclude ckeditor directory from node_modules:
  svgRule.exclude.add( path.join( __dirname, 'node_modules', '@ckeditor' ) );

  // Add an entry for *.svg files belonging to CKEditor. You can either:
  //
  // * modify the existing 'svg' rule:
  //
  //		svgRule.use( 'raw-loader' ).loader( 'raw-loader' );
  //
  // * or add a new one:
  config.module
    .rule( 'cke-svg' )
    .test( /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/ )
    .use( 'raw-loader' )
    .loader( 'raw-loader' );

  // (2.) Transpile the .css files imported by the editor using PostCSS.
  // Make sure only the CSS belonging to ckeditor5-* packages is processed this way.
  config.module
    .rule( 'cke-css' )
    .test( /ckeditor5-[^/\\]+[/\\].+\.css$/ )
    .use( 'postcss-loader' )
    .loader( 'postcss-loader' )
    .tap( () => {
      return styles.getPostCssConfig( {
        themeImporter: {
          themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
        },
        minify: true
      } );
    } );
}

function getStyleLintPlugin() {
  const StyleLintPlugin = require('stylelint-webpack-plugin');
  const plugins = [];
  try {
    plugins.push(new StyleLintPlugin({
      failOnError: false,
      quiet: false,
    }));
  } catch (e) {
    throw e;
  }
  return plugins;
}
/* eslint-enable */
