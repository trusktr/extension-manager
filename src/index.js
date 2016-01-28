
// Import babel-polyfill if you want to polyfill things like Promise,
// Object.values(), etc. Includes Facebook Regenerator if you're using
// generators or async functions.
import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import qsort from 'quicksorter'

let extensions = []

class ExtensionManager extends React.Component {
    render() {
        let exts = this.props.extensions
        return (
            <ul>
                {exts.map(ext => (
                    <li key={ext.id}>
                        <input onChange={this.onChange.bind(this)} type="checkbox" defaultChecked={ext.enabled? true: false} id={`ext-${exts.indexOf(ext)}`} />
                        {ext.name}
                    </li>
                ))}
            </ul>
        )
    }

    onChange(event) {
        let el = event.target
        let exts = this.props.extensions
        let ext = exts[window.parseInt(el.id.replace('ext-', ''))]

        if (el.checked) {
            this.action('enable', ext)
        }
        else {
            this.action('disable', ext)
        }
    }

    action(action, ext) {
        if (action == 'enable') {
            chrome.management.setEnabled(ext.id, true)
        }
        else if (action == 'disable') {
            chrome.management.setEnabled(ext.id, false)
        }
        else if (action == 'remove') {
            // TODO
        }
    }
}

function getExtensionsSortedBy(key) {
    return new Promise(function(resolve) {
        chrome.management.getAll(function(exts) {
            qsort(exts, (a, b) =>
                a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0
            )

            resolve(exts)
        })
    })
}

function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

async function main() {

    // Re-render the ExtensionManager if the number of extensions changes.
    // How does this affect UI rendering?
    while(true) {
        let exts = await getExtensionsSortedBy('name')

        if (extensions.length !== exts.length) {
            extensions = exts
            ReactDOM.render(<ExtensionManager extensions={extensions}/>, document.body)
        }

        // poll every second.
        await sleep(1000)
    }

}

main()
