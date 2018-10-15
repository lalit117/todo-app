
const _ = require('lodash');
var express = require('express');
var router = express.Router()

const {ToDo} = require('../models/todo');
const {ObjectId} = require('mongodb');

router.post('/', (req, res) => {
    var todo = new ToDo({
        text : req.body.text,
    });

    todo.save().then((doc)=> {
        res.send(doc);
    }, (e)=>{
        res.status(400).send(e);
    });
});

router.get('/', (req, res)=>{
    ToDo.find().then((todos)=>{
        res.send({todos});
    }, (err)=>{
        res.status(400).send(err);
    });
});

router.get('/:id', (req,res)=> {
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

router.delete('/:id', (req, res) => {
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

router.patch('/:id', (req, res) => {
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
    });
});

module.exports = router;