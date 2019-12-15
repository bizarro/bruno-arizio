import Scroll from 'locomotive-scroll'
import { each } from 'lodash'

import Appear from 'animations/Appear'
import Text from 'animations/Text'

import Page from 'classes/Page'

export default class extends Page {
  /**
   * Create.
   */
  create () {
    this.element = document.querySelector('.essays')

    this.elements = {
      title: this.element.querySelector('.essays__title h1'),

      list: this.element.querySelector('.essays__list'),
      listWrappers: this.element.querySelectorAll('.essays__list__item__link__wrapper'),

      description: this.element.querySelector('.essays__description p'),

      about: this.element.querySelector('.essays__about'),
      aboutDescriptions: this.element.querySelectorAll('.essays__about__description p'),
      aboutSubtitles: this.element.querySelectorAll('.essays__about__subtitle'),
      aboutLinks: this.element.querySelectorAll('.essays__about__description__line'),
    }

    this.createAnimations()
    this.createLinks()
    this.createScroll()
  }

  createAnimations () {
    this.animations = {}

    each([
      this.elements.title,
      this.elements.description,
      ...this.elements.aboutDescriptions,
      ...this.elements.aboutSubtitles,
      ...this.elements.aboutLinks
    ], (element, index) => {
      this.animations[`animation_${index}`] = new Text({
        append: true,
        element
      })

      element.setAttribute('data-scroll', '')
      element.setAttribute('data-scroll-call', `animation_${index}`)
      element.setAttribute('data-scroll-offset', '15%')
    })

    each(this.elements.listWrappers, (element, index) => {
      this.animations[`animation_list_${index}`] = new Appear({
        element
      })

      element.setAttribute('data-scroll', '')
      element.setAttribute('data-scroll-call', `animation_list_${index}`)
    })
  }

  createLinks () {
    const linksDescription = this.element.querySelectorAll('.essays__description a')

    each(linksDescription, link => {
      link.classList.add('essays__description__link')

      link.setAttribute('data-link',' ')

      link.innerHTML = `
        ${link.innerHTML}

        <svg class="essays__description__link__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
          <path d="M8.7,2.3v6.3H2.3 M8.7,8.7L0.4,0.4" />
        </svg>
      `
    })

    const linksBiography = this.element.querySelectorAll('.essays__about__description--biography a')

    each(linksBiography, link => {
      link.classList.add('essays__about__link')

      link.setAttribute('data-link',' ')

      link.innerHTML = `
        ${link.innerHTML}

        <svg class="essays__about__link__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
          <path d="M8.7,2.3v6.3H2.3 M8.7,8.7L0.4,0.4" />
        </svg>
      `
    })

    const linksItems = this.element.querySelectorAll('.essays__about__description__line a')

    each(linksItems, link => {
      link.setAttribute('data-link',' ')

      link.innerHTML = `
        ${link.innerHTML}

        <svg class="essays__about__link__arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.2 9.2" data-link-arrow>
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
