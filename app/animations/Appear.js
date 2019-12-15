export default class {
  constructor ({ delay = 0, element }) {
    this.delay = delay
    this.element = element

    this.animateOut()
  }

  animateIn () {
    TweenMax.to(this.element, 1.5, {
      autoAlpha: 1,
      delay: this.delay,
      ease: Power4.easeOut,
      y: '0%'
    }, 0.1)
  }

  animateOut () {
    TweenMax.set(this.element, {
      autoAlpha: 0,
      y: '100%'
    })
  }
}
