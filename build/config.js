const webpack = require('webpack');

exports.develop = [
    {
        entry: `${__dirname}/../src/index.js`,
        output: {
            path: `${__dirname}/../examples`,
            filename: 'ip_graph.min.js'
        }
    }
]

exports.production = [
    {
        entry: `${__dirname}/../src/index.js`,
        output: {
            path: `${__dirname}/../dist`,
            filename: 'ip_graph.min.js'
        },
        module: {
            rules: [{
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            }]
        },
        plugins: [
            new webpack.BannerPlugin('hwfhc'),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin()
        ]
    },
    {
        entry: `${__dirname}/../src/index.js`,
        output: {
            path: `${__dirname}/../dist`,
            filename: 'ip_graph.js'
        }
    }
];
