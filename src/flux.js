import mitt from 'mitt';
import React from "react";

const emitter = mitt();
const sources = new WeakMap();

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export function send(action, metadata) {
  emitter.emit(action, metadata);
}

export function receive(action) {
  return new Promise((resolve) => {
    function callback(metadata) {
      emitter.off(action, callback);
      resolve(metadata);
    }

    emitter.on(action, callback);
  });
}

export function pause(millis) {
  return new Promise(resolve => window.setTimeout(resolve, millis));
}

export async function* merge(...generators) {
  const promises = new Map(
    generators.map(g => [g, g.next().then(({ value, done }) => ({ value, done, g }))])
  );

  while(promises.size > 0) {
    const { value, done, g } = await Promise.race(promises.values());

    if (!done) {
      yield value; 
      promises.set(g, g.next().then(({value, done}) => ({ value, done, g })));
    } else {
      promises.delete(g);
    }
  }
}

export function connect(Component, source) {
  class WrappedComponent extends React.Component {
    static displayName = `Connected(${getDisplayName(Component)})`;

    componentDidMount() {
      if (!sources.has(source)) {
        sources.set(source, { consumers: new Set() });

        (async function consumeSource(){
          for await (const state of source) {
            const sourceEntry = sources.get(source);

            sourceEntry.consumers.forEach(
              instance => instance.setState(state)
            );

            sourceEntry.lastValue = state;
          }
        })();
      }

      const sourceEntry = sources.get(source);

      sourceEntry.consumers.add(this);

      if (sourceEntry.lastValue !== undefined) {
        this.setState(lastValue);
      }
    }

    async componentWillUnmount() {
      sources.get(source).consumers.delete(this);
    }

    render() {
      return <Component {...this.state} {...this.props} />
    }
  }

  return WrappedComponent;
}
