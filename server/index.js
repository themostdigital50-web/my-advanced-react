import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors())



app.use(express.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const ageValid = (req, res, next) => {
    if(req.body.age < 18){
        res.status(400).send('You need to be over 18 to create an account')
    }
    next();
}

const validateUser = (req, res, next) => {
  if(!req.body.name || !req.body.email || !req.body.password || !req.body.age){
    res.status(400).send('You must enter a name, email, password and age!');
  }
  next();
} 

const users = [];

app.get('/users', (req, res) => {
    res.json(users)
})

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if(!user) {return res.status(404).send('Cannot find user')};

    res.json(user);
})

app.post('/users', validateUser, ageValid, (req, res) => {
    const user = {
        "id": users.length + 1,
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password,
        "age": req.body.age
    };

    
        users.push(user);
        res.status(201).json(user);

})

app.put('/users/:id', validateUser, ageValid, (req, res) =>{
    const user = users.find(u => u.id === parseInt(req.params.id));
    user.name = req.body.name
    user.email = req.body.email
    user.password = req.body.password
    user.age = req.body.age


    res.json(user)

}
)

app.delete('/users/:id', (req, res) => {
    const findUser = users.findIndex(u => u.id === parseInt(req.params.id))
    if(findUser === -1){return res.status(404).send(`User with id: ${req.params.id} does not exist`)}
    const deleteUser = users.splice(findUser, 1);

    res.json(deleteUser);   
})

app.listen(3000, () => console.log('Running on http:/localhost:3000'));