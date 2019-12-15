import { calculate, split } from 'utils/text'

export default class {
  constructor ({ append = false, delay = 0, element }) {
    this.delay = delay
    this.element = element

    split({
      append,
      element,
      expression: ' '
    })

    split({
      append,
      element,
      expression: ' '
    })

    this.spans = this.element.querySelectorAll('span span')

    this.animateOut()
  }

  animateIn () {
    TweenMax.staggerTo(calculate(this.spans), 1.5, {
      autoAlpha: 1,
      delay: this.delay,
      ease: Power4.easeOut,
      y: '0%'
    }, 0.1)
  }

  animateOut () {
    TweenMax.set(this.spans, {
      autoAlpha: 0,
      y: '100%'
    })
  }
}
