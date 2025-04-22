let nextWorkOfUnit = null
let wipRoot = null
let wipFiber = null
let currentRoot = null
let deletetions = []

// 创建text节点
function createTextNode(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        }
    }
}


/**
 * 创建一个元素节点
 * @param {*} type 
 * @param {*} props 
 * @param  {...any} children 
 * @returns 
 */
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            // 子节点是string类型时调用createTextNode
            children: children.map(child => {
                const isTextNode = typeof child === "string" || typeof child === "number"

                return isTextNode ? createTextNode(child) : child
            })
        }
    }
}


/** render方法
 * 先创建一个节点，文本节点调用createTextNode， 其他节点调用createElement
 * 对传入元素的props进行遍历
 * 如果key是children，则递归调用render方法
 * 否则直接赋值给dom
 * 最后将dom添加到container中
 */
function olerender(el, container) {
    const dom = el.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(el.type);

    Object.keys(el.props).forEach(key => {
        if (key === "children") {
            el.props.children.forEach(child => {
                render(child, dom);
            })
        } else {
            dom[key] = el.props[key];
        }
    })

    container.append(dom)
}

function render(el, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        }
    }


    nextWorkOfUnit = wipRoot
}




function createDom(type) {
    return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type)
}

// 更新props
// function oldupdateProps(dom, props) {
//     Object.keys(props).forEach(key => {
//         if (key !== "children") {
//             // 这里的逻辑是，如果key是事件，则需要添加事件监听
//             if (key.startsWith("on")) {
//                 const eventType = key.toLowerCase().substring(2)
//                 dom.addEventListener(eventType, props[key])
//             }
//             dom[key] = props[key];
//         }
//     })
// }

// 更新props
function updateProps(dom, nextProps, prevProps) {

    // 1. old 有 new没有
    Object.keys(prevProps).forEach(key => {
        if (key === "children") {
            if (!(key in nextProps)) {
                dom.removeAttribute(key)
            }
        }
    })
    // 2. new 有 old没有
    // 3. old 有 new有修改
    Object.keys(nextProps).forEach(key => {
        if (key !== "children") {
            if (prevProps[key] !== nextProps[key]) {
                // 这里的逻辑是，如果key是事件，则需要添加事件监听
                if (key.startsWith("on")) {
                    const eventType = key.toLowerCase().substring(2)
                    dom.removeEventListener(eventType, prevProps[key])
                    dom.addEventListener(eventType, nextProps[key])
                } else {
                    dom[key] = nextProps[key]
                }

            }
        }
    })

}

function reconcileChildren(fiber, children) {
    let oldFiber = fiber.alternate?.child
    let prevChild = null
    // 3、 转换链表，设置好指针
    children.forEach((child, index) => {
        // 比较新旧fiber
        let sameType = oldFiber && oldFiber.type === child.type

        let newFilber
        // 更新
        if (sameType) {
            newFilber = {
                type: child.type,
                props: child.props,
                dom: oldFiber.dom,
                child: null,
                parent: fiber,
                sibling: null,
                effectTag: 'update',
                alternate: oldFiber
            }
        } else {
            if (child) {
                // 创建
                newFilber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    parent: fiber,
                    sibling: null,
                    dom: null,
                    effectTag: 'placement'
                }
            }



            if (oldFiber) {
                deletetions.push(oldFiber)
            }

        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (index === 0) {
            fiber.child = newFilber
        } else {
            prevChild.sibling = newFilber
        }

        // 这里的逻辑是，如果prevChild存在，则将prevChild的sibling指向newFilber
        if (newFilber) {
            prevChild = newFilber
        }
    })


    /** 解决老节点比新节点多的情况，多的可能不止一个节点，将多出的老节点全部删干净 */
    while (oldFiber) {
        deletetions.push(oldFiber)
        oldFiber = oldFiber.sibling
    }
}

function updateFunctionCompontent(fiber) {
    stateHooks = []
    stateHookIndex = 0
    effectHooks = []
    wipFiber = fiber
    const children = [fiber.type(fiber.props)]
    // console.log('commit-children', children, fiber.type, fiber.props)
    reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
    const children = fiber.props?.children
    // map的场景下children嵌套了一层数组，找不到原因，先特殊处理一下
    const handleChildren = []
    for(let i = 0; i < children.length; i++) {
        if(Array.isArray(children[i])) {
            handleChildren.push(...children[i])
        } else {
            handleChildren.push(children[i])
        }
    }

    if (!fiber.dom) {
        // 1、 创建 dom
        const dom = createDom(fiber.type)
        fiber.dom = dom
        // fiber.parent.dom.appendChild(dom)
        // 2、 处理 props
        updateProps(dom, fiber.props, {})
    }


    // 3、 转换链表，设置好指针
    reconcileChildren(fiber, handleChildren)
}


function performWorkOfUnit(fiber) {

    const isFunctionComponent = typeof fiber.type === "function"
    if (isFunctionComponent) {
        // 1、 更新函数组件
        updateFunctionCompontent(fiber)
    } else {
        // 2、 更新原生组件
        updateHostComponent(fiber)
    }
    // 4、 返回下一个要执行的任务
    // 这里的逻辑是，如果当前任务有子任务，则返回子任务
    if (fiber.child) {
        return fiber.child
    }
    // 如果没有子任务，则返回兄弟任务
    if (fiber.sibling) {
        return fiber.sibling
    }
    // 如果没有兄弟任务，则返回父任务的兄弟任务,如果父，则继续向上找
    let nextFileber = fiber
    while (nextFileber.parent) {
        if (nextFileber.sibling) {
            return nextFileber.sibling
        }
        nextFileber = nextFileber.parent
    }
}

function commitRoot() {
    deletetions.forEach(commitDeleteion)
    commitWork(wipRoot.child)
    commitEffectHooks()
    currentRoot = wipRoot
    wipRoot = null
    deletetions = []
}

function commitEffectHooks() {

    function run(fiber) {
        if (!fiber) return
        // 初始化和更新
        if (!fiber.alternate) {
            fiber.effectHooks?.forEach(hook => {
                if (typeof hook.callback === "function") {
                    hook.cleanup = hook.callback()

                }
            })
            fiber.effectHook?.callback()
        } else {
            fiber.effectHooks?.forEach((newhook, index) => {
                if (newhook.deps.length > 0) {
                    // update
                    const oldEffectHook = fiber.alternate?.effectHooks[index]

                    // some
                    const needUpdate = oldEffectHook?.deps.some((oldDep, idx) => {
                        return oldDep !== fiber.effectHook?.deps[idx]
                    })

                    needUpdate && (newhook.cleanup = newhook?.callback())
                }
            })
        }

        fiber.effectHook?.callback()
        run(fiber.child)
        run(fiber.sibling)
    }

    function runCleanup(fiber) {
        if (!fiber) return

        // 一定要执行之前的fiber的effectHooks的cleanup
        fiber.alternate?.effectHooks?.forEach(hook => {
            if (typeof hook.cleanup === "function") {
                hook.cleanup()
            }
        })
        runCleanup(fiber.child)
        runCleanup(fiber.sibling)
    }

    runCleanup(wipRoot)
    run(wipRoot)
}

function commitDeleteion(fiber) {
    if (fiber.dom) {
        let fiberParent = fiber.parent
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent
        }
        fiberParent.dom.removeChild(fiber.dom)
    } else {

        commitDeleteion(fiber.child)
    }
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }

    if (fiber.effectTag === "update" && fiber.dom) {
        updateProps(fiber.dom, fiber.props, fiber.alternate.props)
    } else if (fiber.effectTag === "placement") {
        if (fiber.dom) {
            // 5、 将 dom 添加到父节点中
            fiberParent.dom.appendChild(fiber.dom)
        }
    }


    commitWork(fiber.child)
    commitWork(fiber.sibling)

}

// requestIdleCallback是浏览器提供的一个API，用于在浏览器空闲时执行一些任务
// 这个API会在浏览器空闲时调用一个回调函数，传入一个deadline对象

function workLoop(deadline) {

    let shouldYield = false
    while (!shouldYield && nextWorkOfUnit) {
        // 执行任务
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

        // 优化重新计算量
        if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
            nextWorkOfUnit = undefined
        }


        // 计算剩余线程空闲时间, 没时间就停止
        shouldYield = deadline.timeRemaining() < 4
    }

    if (!nextWorkOfUnit && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

// 更新逻辑
function update() {
    let currentFiber = wipRoot
    return () => {
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }

        nextWorkOfUnit = wipRoot
    }


}

let stateHooks
let stateHookIndex = 0


function useState(initial) {
    let currentFiber = wipRoot
    const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]

    const stateHook = {
        state: oldHook ? oldHook.state : initial,
        queue: oldHook ? oldHook.queue : []
    }

    stateHook.queue.forEach(action => {
        stateHook.state = action(stateHook.state)
    })

    stateHook.queue = []

    stateHookIndex++
    stateHooks.push(stateHook)

    currentFiber.stateHooks = stateHooks

    function setState(action) {
        // 这里是提早判断
        const eagerState = typeof action === "function" ? action(stateHook.state) : action
        if (eagerState === stateHook.state) {
            return
        }
        // 判断action是函数还是对象
        // stateHook.state = action(stateHook.state)
        stateHook.queue.push(typeof action === "function" ? action : () => action)

        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }

        nextWorkOfUnit = wipRoot

    }
    return [stateHook.state, setState]
}

let effectHooks = []

function useEffect(callback, deps) {
    const effectHook = {
        callback,
        deps,
        cleanup: undefined
    }
    effectHooks.push(effectHook)
    wipFiber.effectHooks = effectHooks
}

const React = {
    render,
    createElement,
    update,
    useEffect,
    useState,
}

export default React