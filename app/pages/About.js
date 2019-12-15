import Scroll from 'locomotive-scroll'
import { each } from 'lodash'

import Text from 'animations/Text'

import { Detection } from 'classes/Detection'
import Page from 'classes/Page'

export default class extends Page {
  /**
   * Create.
   */
  create () {
    this.element = document.querySelector('.about')

    this.elements = {
      title: this.element.querySelector('.about__title h1'),
      biography: this.element.querySelectorAll('.about__description--biography p'),
      subtitles: this.element.querySelectorAll('.about__subtitle'),
      links: this.element.querySelectorAll('.about__description__line'),
      credits: this.element.querySelector('.about__description--credits p')
    }

    this.createAnimations()
    this.createLinks()
    this.createScroll()
  }

  createAnimations () {
    this.animations = {}

    each([
      this.elements.title,
      ...this.elements.biography,
      ...this.elements.subtitles,
      ...this.elements.links,
      this.elements.credits
    ], (element, index) => {
      this.animations[`animation_${index}`] = new Text({
        append: true,
        element
      })

      const percent = Detection.isPhone && this.elements.credits === element ? '0%' : '15%'

      element.setAttribute('data-scroll', '')
      element.setAttribute('data-scroll-call', `animation_${index}`)
      element.setAttribute('data-scroll-offset', percent)
    })
  }

  createLinks () {
    const linksTitle = this.element.querySelectorAll('.about__title a')

    each(linksTitle, link => {
      link.classList.add('about__title__highlight')

      link.setAttribute('data-link',' ')

      link.innerHTML = `
        <span class="about__title__highlight__text" data-text="${link.innerHTML}">${link.innerHTML}</span><svg class="about__title__highlight__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
          <path d="M8.7,2.3v6.3H2.3 M8.7,8.7L0.4,0.4" />
        </svg>
      `
    })

    const linksItems = this.element.querySelectorAll('.about__description__line a')

    each(linksItems, link => {
      if (link.href) {
        link.setAttribute('data-link',' ')

        link.innerHTML = `
          ${link.innerHTML}<svg class="about__link__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
            <path d="M8.7,2.3v6.3H2.3 M8.7,8.7L0.4,0.4" />
          </svg>
        `
      }
    })

    const linksBiography = this.element.querySelectorAll('.about__description--biography a')

    each(linksBiography, link => {
      link.classList.add('about__link')

      link.setAttribute('data-link',' ')

      link.innerHTML = `
        ${link.innerHTML}<svg class="about__link__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
          <path d="M8.7,2.3v6.3H2.3 M8.7,8.7L0.4,0.4" />
        </svg>
      `
    })

    const linksCredits = this.element.querySelectorAll('.about__description--credits a')

    each(linksCredits, link => {
      link.classList.add('about__link')

      link.setAttribute('data-link',' ')

      link.innerHTML = `
        ${link.innerHTML}<svg class="about__link__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
          <path d="M8.7,2.3v6.3H2.3 M8.7,8.7L0.4,0.4" />
        </svg>
      `
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

  /**
   * Events.
   */
  onResize () {
    if (this.scroll) {
      this.scroll.update()
    }
  }

  /**
   * Animations.
   */
  show () {
    this.timelineIn = new TimelineMax()

    this.timelineIn.to(this.element, 0.5, {
      autoAlpha: 1
    })

    return super.show(this.timelineIn)
  }

  hide () {
    this.timelineOut = new TimelineMax()

    this.timelineOut.to(this.element, 0.5, {
      autoAlpha: 0
    })

    this.timelineOut.call(() => {
      this.destroy()
    })

    return super.hide(this.timelineOut)
  }

  /**
   * Destroy.
   */
  destroy () {
    if (this.scroll) {
      this.scroll.destroy()
    }
  }
}
