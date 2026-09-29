const express = require('express')
const app = express();
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173' 
}));




app.get('/', (req, res) => {
      res.send('Hello from our server!')
}) 

app.get('/home', (req, res) => {
    res.send('Hello at home')
})

app.listen(3000, () => {
    console.log('Running....')
});
