import { each } from 'lodash'

import { Detection } from 'classes/Detection'
import Page from 'classes/Page'

export default class extends Page {
  /**
   * Create.
   */
  create () {
    this.element = document.querySelector('.home')

    this.elements = {
      projects: this.element.querySelectorAll('.home__project'),
      projectsLinks: this.element.querySelectorAll('.home__project__link'),
      projectsLinksWrappers: this.element.querySelectorAll('.home__project__link__wrapper'),

      progress: this.element.querySelector('.home__progress'),
      progressCircle: this.element.querySelector('.home__progress__circle'),
      progressPath: this.element.querySelector('.home__progress__path'),

      pagination: this.element.querySelector('.home__pagination'),
      paginationWrapper: this.element.querySelector('.home__pagination__wrapper'),
      paginationNumber: this.element.querySelector('.home__pagination__number')
    }

    if (this.elements.progress) {
      const length = this.elements.progressPath.getTotalLength()

      this.elements.progressCircle.style.strokeDasharray = `${length}px`
      this.elements.progressCircle.style.strokeDashoffset = `${length}px`

      this.elements.progressPath.style.strokeDasharray = `${length}px`
      this.elements.progressPath.style.strokeDashoffset = `${length}px`
    }
  }

  /**
   * Events.
   */
  onCanvasChange (index = 0) {
    this.elements.paginationNumber.innerHTML = `${index + 1}`

    each(this.elements.projects, (project, projectIndex) => {
      if (index === projectIndex) {
        project.classList.add('home__project--active')
      } else {
        project.classList.remove('home__project--active')
      }
    })

    if (this.elements.progress) {
      const length = this.elements.progressPath.getTotalLength()
      const progress = (index + 1) / this.elements.projects.length
      const strokeDashoffset = length - length * progress

      this.elements.progressPath.style.strokeDashoffset = `${strokeDashoffset}px`
    }
  }

  /**
   * Animations.
   */
  show (index = 0, isFromPreloader = false) {
    const ease = Power4.easeOut

    this.onCanvasChange(index)

    this.timelineIn = new TimelineMax({
      delay: Detection.isPhone && isFromPreloader ? 3 : 1
    })

    this.timelineIn.set(this.element, {
      autoAlpha: 1
    })

    this.timelineIn.fromTo(this.elements.paginationWrapper, 1.5, {
      y: '100%'
    }, {
      ease,
      y: '0%'
    })

    this.timelineIn.fromTo(this.elements.projectsLinksWrappers, 1.5, {
      y: '100%'
    }, {
      ease,
      y: '0%'
    }, '-= 1.4')

    if (this.elements.progress) {
      this.timelineIn.to(this.elements.progressCircle, 1.5, {
        ease,
        strokeDashoffset: 0
      }, '-= 1.4')
    }

    return super.show(this.timelineIn)
  }

  hide () {
    const ease = Power4.easeOut

    this.timelineOut = new TimelineMax()

    this.timelineOut.to(this.elements.paginationWrapper, 1.5, {
      ease,
      y: '100%'
    })

    this.timelineOut.to(this.elements.projectsLinksWrappers, 1.5, {
      ease,
      y: '100%'
    }, '-= 1.4')

    if (this.elements.progress) {
      this.timelineOut.to([this.elements.progressCircle, this.elements.progressPath], 1.5, {
        ease,
        strokeDashoffset: this.elements.progressCircle.getTotalLength(),
        transition: 'none'
      }, '-= 1.4')
    }

    this.timelineOut.set(this.element, {
      autoAlpha: 0
    })

    return super.hide(this.timelineOut)
  }

  /**
   * Events.
   */
  onTouchDown () {
    if (Detection.isPhone) {
      TweenMax.killTweensOf(this.element)

      TweenMax.to(this.element, 0.2, {
        autoAlpha: 0
      })
    }
  }

  onTouchUp () {
    if (Detection.isPhone) {
      TweenMax.killTweensOf(this.element)

      TweenMax.to(this.element, 0.2, {
        autoAlpha: 1,
        delay: 0.4
      })
    }
  }

  /**
   * Destroy.
   */
  destroy () {

  }
}
