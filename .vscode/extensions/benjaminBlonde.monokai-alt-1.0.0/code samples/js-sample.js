import React, { Component } from 'react';
import utils from './utils';
import config from './config';
/**
 * Constructor for sample code
 * @param {string} url - The URL to request
 */
function foo(bar) {
  switch(bar) {
    case 'foo':
      return `values is: ${bar.length}`
  }
}
class Controls {/* ... */}
export default class App extends Component {
  constructor(props) {/* ... */}
  render() {
    var wrapperWidth = utils.getWrapperWidth();
    // Some comment
    const state = typeof this.state !== undefined ? this.state : null;
    let canvasStyle = this.pixelRatio > 1 ? { width: `${wrapperWidth}px` } : {};
    let width = Math.floor(window.innerWidth);
    var a = "\u1111\z\n".replace(/^\s*(.*)/, "$1");
    let x = someArray.map(el => el * 2);
    return (
      <div className="main-wrapper" style={{ backgroundColor: config.colors }}>
          <canvas width={wrapperWidth * this.pixelRatio}
                  style={canvasStyle !== true ? canvasSTyle : false}
                  ref={(canvas) => {this.canvas = canvas}}>
          </canvas>
          {...state.elements()}
        <Controls isActive={state.isActive} />
      </div>
    )
  }
}
