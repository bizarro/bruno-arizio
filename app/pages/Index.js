import { Detection } from 'classes/Detection'

import Page from 'classes/Page'

export default class extends Page {
  /**
   * Create.
   */
  create () {
    this.element = document.querySelector('.index')

    this.elements = {

    }

    if (Detection.isSafari) {
      this.element.classList.add('index--safari')
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

  }
}
