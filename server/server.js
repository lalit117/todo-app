
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {ToDo} = require('./models/todo');
const {ObjectId} = require('mongodb');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new ToDo({
        text : req.body.text,
    });

    todo.save().then((doc)=> {
        res.send(doc);
    }, (e)=>{
        res.status(400).send(e);
    })
});

app.get('/todos', (req, res)=>{
    ToDo.find().then((todos)=>{
        res.send({todos});
    }, (err)=>{
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req,res)=> {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send('Not a Valid ID.');
    } 

    ToDo.findById(id).then((todo)=>{
        if (!todo) {
            return res.status(404).send('Id Not Found.');
        } 

        res.send({todo});
    }).catch((e) => {
        res.status(400).send('Failed To process request');
    });   
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    
    if (!ObjectId.isValid(id)) {
        return res.status(404).send('Not a Valid ID.');
    } 

    ToDo.findByIdAndRemove(id).then((todo)=>{
        if (!todo) {
            return res.status(404).send('Id Not Found.');
        } 

        res.send({todo});
    }).catch((err) => {
        console.log(err);
        res.status(400).send('Failed To process request');
    }); 
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send('Not a Valid ID.');
    } 

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null; 
    }

    ToDo.findByIdAndUpdate(id, {$set : body}, {new: true})
    .then((todo) => {
        if (!todo) {
            res.status(400).send();
        }

        res.send({todo});
    })
    .catch((err) => {
        console.log(err);
        res.status(400).send();
    })
});

app.listen(port, ()=>{
    console.log('Server started, Port : ' + port);
})

module.exports = {app};
