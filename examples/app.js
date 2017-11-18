const directory = __dirname;
const app = require('express')();

initRoutes(app,directory);


const server = app.listen(8080,function(){
    console.log(`Worker ${process.pid} start`);
});


function initRoutes(app,directory){
    require('./routes/index.js')(app,directory);
}
