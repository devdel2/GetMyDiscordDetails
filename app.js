// EXPRESS SETUP
const express = require('express');
const app = express();
const port = 3000;

// view engine support - NEED TO MOVE OUT OF THIS JS
const pug = require('pug');
const compiledFunc = pug.compileFile('./views/layout.pug');

// Path support
const path = require('path');

// Default test get route
app.get('/', (req, res) => {
    res.send(compiledFunc({
        path: 'Devin'
    }));
});

// broadcast message on router
app.listen(port, () => {
    console.log(`example app listening on port ${port}`);
});
