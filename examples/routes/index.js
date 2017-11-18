module.exports = initRoutes;

function initRoutes(app,directory){
    app.get('/',function(req,res){
        res.sendFile(`${directory}/views/index.html`);
    });

    app.get('/ip_graph.min.js',function(req,res){
        res.sendFile(`${directory}/ip_graph.min.js`);
    });
}
