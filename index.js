const express = require('express');
const { caliculateTax } = require('./taxController')
const app = express();

app.use(express.json());

app.post('/api/tax', caliculateTax);

app.listen(3000, () => {
    console.log(`Server started on port 3000. http://localhost:3000`);
})