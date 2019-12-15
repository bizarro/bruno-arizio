import { each, find } from 'lodash'

import EventEmitter from 'events'

export default class extends EventEmitter {
  constructor () {
    super()

    this.element = document.querySelector('.navigation')

    this.elements = {
      links: this.element.querySelectorAll('.navigation__link'),
      linksTexts: this.element.querySelectorAll('.navigation__link__text')
    }

    this.create()
  }

  /**
   * Create.
   */
  create () {

  }

  /**
   * Animations.
   */
  show (slug) {
    this.create()
    this.clear()

    const ease = Power4.easeOut

    this.timelineIn = new TimelineMax()

    this.timelineIn.call(() => document.body.appendChild(this.element))

    this.timelineIn.staggerFromTo(this.elements.linksTexts, 1.5, {
      y: '100%'
    }, {
      ease,
      y: '0%'
    }, 0.05)

    this.timelineIn.set(this.elements.links, {
      pointerEvents: 'auto'
    })

    this.onChange(slug)
  }

  hide () {
    this.clear()

    const ease = Power4.easeOut

    this.timelineOut = new TimelineMax()

    this.timelineOut.set(this.elements.links, {
      pointerEvents: 'none'
    })

    this.timelineOut.staggerTo(this.elements.linksTexts, 1.5, {
      ease,
      y: '100%'
    }, 0.05)
  }

  clear () {
    if (this.timelineIn) {
      this.timelineIn.kill()
      this.timelineIn = null
    }

    if (this.timelineOut) {
      this.timelineOut.kill()
      this.timelineOut = null
    }
  }

  /**
   * Events.
   */
  onNavigationStart () {
    this.hide()
  }

  onNavigationEnd (slug) {
    this.show(slug)
  }

  onChange (slug) {
    TweenMax.set(this.element, {
      mixBlendMode: slug === 'home' ? 'inherit' : 'difference'
    })
  }
}
