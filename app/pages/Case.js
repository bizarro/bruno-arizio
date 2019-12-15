import Scroll from 'locomotive-scroll'
import { each, map } from 'lodash'

import Text from 'animations/Text'

import Page from 'classes/Page'
import Slider from 'classes/Slider'

import { split } from 'utils/text'

export default class extends Page {
  /**
   * Create.
   */
  create () {
    this.element = document.querySelector('.case')

    this.index = parseInt(this.element.dataset.index, 10)

    this.elements = {
      header: this.element.querySelector('.case__header'),
      headerButton: document.querySelector('.case__header__button'),

      information: this.element.querySelector('.case__information'),
      informationTexts: this.element.querySelectorAll('.case__information__text'),
      informationDescription: this.element.querySelector('.case__information__description'),

      highlights: this.element.querySelectorAll('.case__highlight'),
      highlightsText: this.element.querySelectorAll('.case__highlight__text'),
    }

    this.createAnimations()
    this.createScroll()
    this.createSliders()
  }

  createAnimations () {
    this.animations = {}

    each([
      ...this.elements.informationTexts,
      this.elements.informationDescription
    ], (element, index) => {
      this.animations[`animation_${index}`] = new Text({
        append: true,
        element
      })

      element.setAttribute('data-scroll', '')
      element.setAttribute('data-scroll-call', `animation_${index}`)
      element.setAttribute('data-scroll-offset', '15%')
    })
  }

  createScroll () {
    this.scroll = new Scroll({
      el: this.element,
      scrollbarClass: 'scrollbar',
      smooth: true,
      smoothMobile: true
    })

    this.scroll.on('call', id => {
      if (this.animations[id]) {
        this.animations[id].animateIn()
      }
    })
  }

  createSliders () {
    this.sliders = map(this.elements.highlightsText, element => {
      split({ element })
      split({ element })

      const items = element.childNodes
      const buttons = element.querySelectorAll('span > span')

      return new Slider({
        element,
        elements: {
          buttons,
          items
        }
      })
    })
  }

  /**
   * Events.
   */
  onResize () {
    if (this.scroll) {
      this.scroll.update()
    }

    each(this.sliders, slider => {
      slider.onResize()
    })
  }

  onWheel (speed) {
    if (speed < 0) {
      each(this.sliders, slider => {
        slider.onRight()
      })
    } else if (speed > 0) {
      each(this.sliders, slider => {
        slider.onLeft()
      })
    }
  }

  /**
   * Animations.
   */
  show () {
    this.timelineIn = new TimelineMax()

    this.timelineIn.to(this.element, 0.5, {
      autoAlpha: 1
    }, 'start')

    this.timelineIn.fromTo(this.elements.headerButton, 0.5, {
      autoAlpha: 0
    }, {
      autoAlpha: 1
    }, 'start')

    return super.show(this.timelineIn)
  }

  hide () {
    this.destroy()

    this.timelineOut = new TimelineMax()

    this.timelineOut.to(this.element, 1.75, {
      ease: Power4.easeOut,
      y: 0
    })

    this.timelineOut.to(this.elements.headerButton, 0.5, {
      autoAlpha: 0
    }, 'start')

    this.timelineOut.to(this.element, 0.5, {
      autoAlpha: 0
    }, 'start')

    return super.hide(this.timelineOut)
  }

  /**
   * Destroy.
   */
  destroy () {
    if (this.scroll) {
      this.scroll.destroy()
    }

    each(this.sliders, slider => {
      slider.destroy()
    })
  }
}
