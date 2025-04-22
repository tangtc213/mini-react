/** @jsx CReact.createElement */
import CReact from "../core/React.js";

export default function Todos() {

    const [todos, setTodos] = CReact.useState([
        { id: 1, text: '吃饭' },
        { id: 2, text: '睡觉' },
        { id: 3, text: '打豆豆' },
    ])

    const [text, setText] = CReact.useState('')

    function handleAdd() {
        if (!text) return
        const newTodo = {
            id: Date.now(),
            text
        }
        console.log(newTodo)
        setTodos([...todos, newTodo])
        setText('')
    }

    function handleChange(e) {
        setText(e.target.value)
    }

    function handleDelete(id) {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    return (
        <div>
            <h1>Todos</h1>
            <div>
                <input value={text} type="text" onChange={handleChange} />
                <button onClick={handleAdd}>add</button>
            </div>
            <ul>
                {
                    todos.map(todo => {
                        return (
                            <li key={todo.id}>
                                <input type="checkbox" />
                                <span>{todo.text}</span>
                                <button onClick={() => handleDelete(todo.id)}>delete</button>
                            </li>
                        )
                    })
                }
            </ul>


        </div>
    )
}