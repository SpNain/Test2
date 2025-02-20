import { Router } from 'express';

import { Todo } from '../models/todo';

let todo: Todo[] = [];

const router = Router();

router.get('/', (req, res, next) => {
    res.status(200).json({ todo: todo});
});

router.post('/todo', (req, res,next) => {
    const newTodo: Todo = {
        id: new Date().toISOString(),
        text: req.body.text
    };

    todo.push(newTodo);
    res.status(201).json({ message: 'Added newTodo', todo: newTodo, Todo: todo });
});


router.put('/todo/:todoId', (req,res,next) => {
    const tid = req.params.todoId;
    const todoIndex = todo.findIndex(todoItem => todoItem.id === tid);
    if (todoIndex >= 0) {
        todo[todoIndex] = { id: todo[todoIndex].id, text: req.body.text };
        return res.status(200).json({ message : 'Updated Todo Sucessfully', todo: todo });
    }
    res.status(404).json({ message : 'Could not find the id to update'});
});

router.delete('/todo/:todoId', (req, res, next) => {
    todo = todo.filter(todoItem => todoItem.id !== req.params.todoId );
    res.status(200).json({ message: 'Deleted Todo', todo: todo });
    
});



export default router;