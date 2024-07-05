import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import Link from 'next/link';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const Todos = () => {
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);


    useEffect(() => {
        const sub = client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        });
        return () => { sub.unsubscribe() };
    }, []);

    function testing() {
        console.log('hahaha gotcha')
        return Math.random().toString()
    }

    function createTodo({ }) {
        client.models.Todo.create({
            content: window.prompt("Todo content"),
            id: testing()
        });
    }


    function deleteTodo(id: string) {
        client.models.Todo.delete({ id })
    }

    return (
        <div>
            <h1>To Do List</h1>
            <button onClick={createTodo}>+ new</button>
            <ul>
                {todos.map((todo) => (
                    <li>
                        {todo.content}                             <button onClick={()=>deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <Link href="/"><button>Return to Home</button></Link>
        </div>
    );
}

export default Todos;
