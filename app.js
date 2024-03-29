const express = require('express');
const app = express();
const port = 3000;

const pug = require('pug');
const compiledFunc = pug.compileFile('./views/layout.pug');

app.get('/', (req, res) => {
    res.send(compiledFunc({
        name: 'Devin'
    }));
});

app.listen(port, () => {
    console.log(`example app listening on port ${port}`);
});
