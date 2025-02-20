"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var todo = [];
var router = (0, express_1.Router)();
router.get('/', function (req, res, next) {
    res.status(200).json({ todo: todo });
});
router.post('/todo', function (req, res, next) {
    var newTodo = {
        id: new Date().toISOString(),
        text: req.body.text
    };
    todo.push(newTodo);
    res.status(201).json({ message: 'Added newTodo', todo: newTodo, Todo: todo });
});
router.put('/todo/:todoId', function (req, res, next) {
    var tid = req.params.todoId;
    var todoIndex = todo.findIndex(function (todoItem) { return todoItem.id === tid; });
    if (todoIndex >= 0) {
        todo[todoIndex] = { id: todo[todoIndex].id, text: req.body.text };
        return res.status(200).json({ message: 'Updated Todo Sucessfully', todo: todo });
    }
    res.status(404).json({ message: 'Could not find the id to update' });
});
router.delete('/todo/:todoId', function (req, res, next) {
    todo = todo.filter(function (todoItem) { return todoItem.id !== req.params.todoId; });
    res.status(200).json({ message: 'Deleted Todo', todo: todo });
});
exports.default = router;
