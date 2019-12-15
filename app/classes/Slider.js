import EventEmitter from 'events'
import { each } from 'lodash'

import { Detection } from 'classes/Detection'

import { getOffset } from 'utils/dom'

export default class extends EventEmitter {
  constructor ({ element, elements, target = 0 }) {
    super()

    this.element = element
    this.elements = elements

    this.scroll = {
      position: 0,
      current: 0,
      target,
      last: 0
    }

    this.onLeft()

    each(this.elements.buttons, button => {
      button.offset = getOffset(button).left
      button.position = 0
    })

    this.update()
  }

  onLeft () {
    this.direction = 'left'
    this.speed = Detection.isPhone ? 1 : 7.5
  }

  onRight () {
    this.direction = 'right'
    this.speed = Detection.isPhone ? -1 : -7.5
  }

  update () {
    if (!this.isDown) {
      this.scroll.target += this.speed
    }

    this.scroll.current += (this.scroll.target - this.scroll.current) * 0.1

    each(this.elements.items, item => {
      TweenMax.set(item, {
        x: -this.scroll.current
      })
    })

    each(this.elements.buttons, (element, index) => {
      const { clientWidth } = this.element

      const position = (element.offset + element.position + element.clientWidth - this.scroll.current)

      element.isBefore = position < 0
      element.isAfter = position > clientWidth

      if (this.direction === 'left' && element.isBefore) {
        element.position = element.position + clientWidth

        element.isBefore = false
        element.isAfter = false

        TweenMax.set(element, {
          x: element.position
        })
      }

      if (this.direction === 'right' && element.isAfter) {
        element.position = element.position - clientWidth

        element.isBefore = false
        element.isAfter = false

        TweenMax.set(element, {
          x: element.position
        })
      }
    })

    this.scroll.last = this.scroll.current

    this.frame = requestAnimationFrame(this.update.bind(this))
  }

  onResize () {
    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      last: 0
    }

    each(this.elements.items, item => {
      TweenMax.set(item, {
        clearProps: 'x'
      })
    })

    each(this.elements.buttons, button => {
      button.offset = getOffset(button).left
      button.position = 0

      TweenMax.set(button, {
        clearProps: 'x'
      })
    })
  }

  destroy () {
    window.cancelAnimationFrame(this.frame)
  }
}
