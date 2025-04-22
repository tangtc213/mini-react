
/** @jsx CReact.createElement */
import CReact from "../core/React.js";
import Todos from "./Todos.jsx";

let count = 10

// function Counter({ num }) {

//     function handleClick() {
//         console.log('click')
//         count++
//         CReact.update()
//     }
//     return <div>count: {count}<button onClick={handleClick} >+</button></div>
// }

// function CounterContainer() {
//     return <div>
//         <Counter num={1}></Counter>
//         <Counter num={20}></Counter>
//     </div>
// }

let showBar = false
// function Counter() {
//     // const foo = <div>foo</div>
//     function Foo() { return <div>foo</div> }
//     const bar = <p>bar</p>

//     function handleShowBar() {
//         showBar = !showBar
//         CReact.update()
//     }

//     return (
//         <div>
//             <button onClick={handleShowBar}>show bar</button>
//             {showBar ? bar : <Foo></Foo>}
//         </div>
//     )
// }

// function Counter() {
//     const foo = (<div>foo
//         <div>child</div>
//         <div>child</div>
//     </div>)
//     const bar = <div>bar</div>

//     function handleShowBar() {
//         showBar = !showBar
//         CReact.update()
//     }
//     return (
//         <div>
//             <button onClick={handleShowBar}>show bar</button>
//             {showBar && bar}
//         </div>
//     )
// }

let countFoo = 0
function Foo() {
    const [count, setCount] = CReact.useState(0)
    const [bar, setBar] = CReact.useState('bar')

    const handleClick = () => {
        console.log('click')
        countFoo++
        setCount((c) => {
            console.log('foo click')
            return c + 1
        })
        setBar((s) => `${s}s`)
    }

    CReact.useEffect(() => {
        console.log('foo effect init')
        return () => {
            console.log('foo effect  init cleanup')
        }
    }, [])
    
    CReact.useEffect(() => {
        console.log('foo effect')
        return () => {
            console.log('foo effect cleanup')
        }
    }, [count])

    return <div>foo
        {count} {bar}
        <button onClick={
            handleClick
        }>click</button >
    </div >
}

let countBar = 0
function Bar() {
    const updater = CReact.update()
    return <div>bar{
        countBar}
        <button onClick={() => {
            countBar++
            updater()
            console.log('bar click')
        }}>click</button>
    </div>
}

let countRoot = 0
function App() {
    console.log('App render')
    const updater = CReact.update()

    function hnandleClick() {
        console.log('click')
        countRoot++
        updater()
    }


    return (
        <div id="haha">
            <Todos></Todos>
        </div>
    )
}

export default App