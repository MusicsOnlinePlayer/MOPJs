const express = require('express');
const app = express();

app.use(require('./Server/Routes/index'));

app.listen(3000);
