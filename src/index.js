import React, {Component} from 'react'
import {Card, CardList, MarkdownCard} from './components'
import TestCard from './TestCard'
import StatefulCard from './StatefulCard'
import Container from './Container'
import namespaceStore from './namespaceStore'
import style from './style.less'

let store = namespaceStore()

const main = (namespaces, history) => {
  return <Container namespaces={namespaces} history={history} />
}

class HotNotify extends Component {
  constructor(props) {
    super(props)
    this._node = null
  }
  componentWillReceiveProps() {
    // TODO will this really only be triggered by a hot update?
    this._node.style.opacity = 100
    setTimeout(() => this._node.style.opacity = 0, 500)
  }
  render() {
    return (
      <div ref={node => this._node = node}
        className={style.hotNotify}>Hot Update</div>
    )
  }
}

// initialize...
export const Root = ({ history }) => (
  <div>
    { main(store.get(), history) }
    <HotNotify/>
  </div>
)

// subscribe to changes
var f = store.subscribe(main)

const isStr = x =>
  Object.prototype.toString.call(x) === '[object String]'

const processArgs = args => {
  const [fst] = args
  if (isStr(fst)) {
    const [, content, opts] = args
    return [content, {...opts, doc: fst}]
  } else {
    const [content, opts = {}] = args
    return [content, opts]
  }
}

export default function(namespace = 'default') {
  const cards = []
  let nextId = 1
  store.set(namespace, cards)
  return {
    card(...args) {
      const [content, opts] = processArgs(args)
      const CardImpl = typeof content === 'function' ? StatefulCard : Card
      cards.push(<CardImpl {...opts} key={nextId++}>{content}</CardImpl>)
    },
    list() {
      return cards
    },
    component() {
      return <CardList namespace={namespace}>{cards}</CardList>
    },
    test(...args) {
      const [content, opts] = processArgs(args)
      cards.push(<TestCard {...opts} key={nextId++} testModule={content}/>)
    },
    markdown(text) {
      cards.push(<MarkdownCard key={nextId++}>{text}</MarkdownCard>)
    }
  }
}
