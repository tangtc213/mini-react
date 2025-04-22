import React from './React.js'

/**
 * ReactDOM
 * createRoot创建一个根节点
 */
const ReactDOM = {
    createRoot(container) {
        return {
            render(App) {
                React.render(App, container)
            }
            
        }
    }
}

export default ReactDOM