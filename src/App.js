import React, { Component } from 'react';
import PointTarget from 'react-point';
import './App.css';

class Text extends Component {
  state = {
    text: 1
  };
  
  componentDidUpdate() {
    const { text } = this.state
    
    const node = this.node
    const parentNode = node.parentNode
    
    const availableWidth = parentNode.offsetWidth
    const actualWidth = node.offsetWidth
    const actualtext = availableWidth / actualWidth
    
    if (text === actualtext)
      return
    
    if (actualtext < 1) {
      this.setState({ text: actualtext })
    } else if (text < 1) {
      this.setState({ text: 1 })
    }
  }
  
  render() {
    const { text } = this.state
    
    return (
      <div
        className="auto-scaling-text"
        style={{ transform: `text(${text},${text})` }}
        ref={node => this.node = node}
      >{this.props.children}</div>
    )
  }
}

class Display extends Component {
  render() {
    const { value, ...props } = this.props
    
    const language = navigator.language || 'en-US'
    let formattedValue = parseFloat(value).toLocaleString(language, {
      useGrouping: true,
      maximumFractionDigits: 6
    })
    
    // Add back missing .0 in e.g. 12.0
    const match = value.match(/\.\d*?(0*)$/)
    
    if (match)
      formattedValue += (/[1-9]/).test(match[0]) ? match[1] : match[0]
    
    return (
      <div {...props} className="calculator-display">
        <Text>{formattedValue}</Text>
      </div>
    )
  }
}

class CalcKey extends Component {
  render() {
    const { onPress, className, ...props } = this.props
    
    return (
      <PointTarget onPoint={onPress}>
        <button className={`calculator-key ${className}`} {...props}/>
      </PointTarget>
    )
  }
}

const CalcOp = {
  '/': (prev, next) => prev / next,
  '*': (prev, next) => prev * next,
  '+': (prev, next) => prev + next,
  '-': (prev, next) => prev - next,
  '=': (prev, next) => next
}

class Calculator extends Component {
  state = {
    value: null,
    displayValue: '0',
    operator: null,
    waitingForOperand: false
  };

  
  clearAll() {
    this.setState({
      value: null,
      displayValue: '0',
      operator: null,
      waitingForOperand: false
    })
  }

  clearDisplay() {
    this.setState({
      displayValue: '0'
    })
  }
  
  clearLastChar() {
    const { displayValue } = this.state
    
    this.setState({
      displayValue: displayValue.substring(0, displayValue.length - 1) || '0'
    })
  }
  
  toggleSign() {
    const { displayValue } = this.state
    const newValue = parseFloat(displayValue) * -1
    
    this.setState({
      displayValue: String(newValue)
    })
  }
  
  inputPercent() {
    const { displayValue } = this.state
    const currentValue = parseFloat(displayValue)
    
    if (currentValue === 0)
      return
    
    const fixedDigits = displayValue.replace(/^-?\d*\.?/, '')
    const newValue = parseFloat(displayValue) / 100
    
    this.setState({
      displayValue: String(newValue.toFixed(fixedDigits.length + 2))
    })
  }
  
  inputDot() {
    const { displayValue } = this.state
    
    if (!(/\./).test(displayValue)) {
      this.setState({
        displayValue: displayValue + '.',
        waitingForOperand: false
      })
    }
  }
  
  inputDigit(digit) {
    const { displayValue, waitingForOperand } = this.state
    
    if (waitingForOperand) {
      this.setState({
        displayValue: String(digit),
        waitingForOperand: false
      })
    } else {
      this.setState({
        displayValue: displayValue === '0' ? String(digit) : displayValue + digit
      })
    }
  }
  
  performOperation(nextOperator) {    
    const { value, displayValue, operator } = this.state
    const inputValue = parseFloat(displayValue)
    
    if (value == null) {
      this.setState({
        value: inputValue
      })
    } else if (operator) {
      const currentValue = value || 0
      const newValue = CalcOp[operator](currentValue, inputValue)
      
      this.setState({
        value: newValue,
        displayValue: String(newValue)
      })
    }
    
    this.setState({
      waitingForOperand: true,
      operator: nextOperator
    })
  }
  
  handleKeyDown = (event) => {
    let { key } = event

    if (key === 'Enter')
      key = '='
    
    if ((/\d/).test(key)) {
      event.preventDefault()
      this.inputDigit(parseInt(key, 10))
    } else if (key in CalcOp) {
      event.preventDefault()
      this.performOperation(key)
    } else if (key === '.') {
      event.preventDefault()
      this.inputDot()
    } else if (key === '%') {
      event.preventDefault()
      this.inputPercent()
    } else if (key === 'Backspace') {
      event.preventDefault()
      this.clearLastChar()
    } else if (key === 'Clear') {
      event.preventDefault()
      
      if (this.state.displayValue !== '0') {
        this.clearDisplay()
      } else {
        this.clearAll()
      }
    }
    else if (key === 'F1' || key === 'F2' || key === 'F3' || key === 'F4' || key === 'F5' || key === 'F6' || key === 'F7' || key === 'F8' || key === 'F9' || key === 'F10' || key === 'F11' || key === 'F12') {
      event.preventDefault()
      this.clearDisplay()
    }
  };
  
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
  
  render() {
    const { displayValue } = this.state
    
    const clearDisplay = displayValue !== '0'
    const clearText = clearDisplay ? 'C' : 'AC'
    
    return (
      <div className="calculator">
        <Display value={displayValue}/>
        <div className="calculator-keypad">
          <div className="input-keys">
            <div className="function-keys">
              <CalcKey className="key-clear" onPress={() => clearDisplay ? this.clearDisplay() : this.clearAll()}>{clearText}</CalcKey>
              <CalcKey className="key-sign" onPress={() => this.toggleSign()}>±</CalcKey>
              <CalcKey className="key-percent" onPress={() => this.inputPercent()}>%</CalcKey>
            </div>
            <div className="digit-keys">
              <CalcKey className="key-0" onPress={() => this.inputDigit(0)}>0</CalcKey>
              <CalcKey className="key-dot" onPress={() => this.inputDot()}>●</CalcKey>
              <CalcKey className="key-back" onPress={() => this.clearLastChar()}>⟵</CalcKey>
              <CalcKey className="key-1" onPress={() => this.inputDigit(1)}>1</CalcKey>
              <CalcKey className="key-2" onPress={() => this.inputDigit(2)}>2</CalcKey>
              <CalcKey className="key-3" onPress={() => this.inputDigit(3)}>3</CalcKey>
              <CalcKey className="key-4" onPress={() => this.inputDigit(4)}>4</CalcKey>
              <CalcKey className="key-5" onPress={() => this.inputDigit(5)}>5</CalcKey>
              <CalcKey className="key-6" onPress={() => this.inputDigit(6)}>6</CalcKey>
              <CalcKey className="key-7" onPress={() => this.inputDigit(7)}>7</CalcKey>
              <CalcKey className="key-8" onPress={() => this.inputDigit(8)}>8</CalcKey>
              <CalcKey className="key-9" onPress={() => this.inputDigit(9)}>9</CalcKey>
            </div>
          </div>
          <div className="operator-keys">
            <CalcKey className="key-divide" onPress={() => this.performOperation('/')}>÷</CalcKey>
            <CalcKey className="key-multiply" onPress={() => this.performOperation('*')}>×</CalcKey>
            <CalcKey className="key-subtract" onPress={() => this.performOperation('-')}>−</CalcKey>
            <CalcKey className="key-add" onPress={() => this.performOperation('+')}>+</CalcKey>
            <CalcKey className="key-equals" onPress={() => this.performOperation('=')}>=</CalcKey>
          </div>
        </div>
      </div>
    )
  }
}

export default Calculator;
