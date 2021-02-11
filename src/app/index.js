import EventEmitter from 'events'
import { INVALID_OUTPUT } from '../errors'
import { CustomException } from '../helpers'

/**
 * A application type module
 * @module app
 */
/**
 * Operation Class handles outputs for app layer
 * @memberof module:app
 */
export class Operation extends EventEmitter {
  /**
   * Set the outputs
   *
   * @memberof module:app.Operation
   * @returns {void}
   */
  static setOutputs (outputs) {
    Object.defineProperty(this.prototype, 'outputs', {
      value: createOutputs(outputs)
    })
  }

  /**
   * Adds a listener on appropriate output event
   *
   * @memberof module:app.Operation
   * @method
   * @param {string} output the specified output to link to the listener handler
   * @param {function} handler the handler for the listener
   * @throws {Error}
   * @returns {void}
   */
  on (output, handler) {
    if (this.outputs[output]) {
      return this.addListener(output, handler)
    }
    throw new CustomException(
      `Invalid output "${output}" to operation ${this.constructor.name}.`,
      INVALID_OUTPUT.code
    )
  }
}

/**
 * Creates the output for the instance
 *
 * @memberof module:app.Operation
 * @method
 * @param {string[]} outputsArray The array of outputs to create
 * @returns {string[]}
 */
const createOutputs = outputsArray => {
  return outputsArray.reduce((obj, output) => {
    obj[output] = output
    return obj
  }, Object.create(null))
}
