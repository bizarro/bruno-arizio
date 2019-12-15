import { Group } from 'three'
import { each } from 'lodash'

import Title from './Title'

export default class extends Group {
  constructor ({ sizes, titlesFills }) {
    super()

    this.sizes = sizes

    this.createElements(sizes, titlesFills)
  }

  /**
   * Create.
   */
  createElements (sizes, titlesFills) {
    each(titlesFills, (value, index) => {
      const title = new Title({
        fill: titlesFills[index],
        index,
        sizes
      })

      this.add(title)
    })
  }

  onResize ({ sizes, titlesFills }) {
    this.sizes = sizes

    each(this.children, (child, index) => {
      child.onResize({
        fill: titlesFills[index],
        sizes
      })
    })
  }

  /**
   * Animations.
   */
  show (pathname, onComplete) {
    if (pathname !== 'home' && pathname !== 'index') {
      const ease = Expo.easeOut

      this.timelineIn = new TimelineMax({
        onComplete
      })

      this.timelineIn.fromTo(this.position, 2, {
        y: -this.sizes.environment.height * 1.33
      }, {
        ease,
        y: 0
      })
    }
  }

  hide (pathname, onComplete) {
    if (pathname === 'about' || pathname === 'essays') {
      return new Promise(resolve => {
        const ease = Expo.easeOut

        this.timelineOut = new TimelineMax({
          onComplete
        })

        this.timelineOut.to(this.position, 2, {
          ease,
          y: this.sizes.environment.height * 1.33
        })

        this.timelineOut.call(() => {
          resolve()
        })
      })
    } else if (pathname === 'case') {
      return new Promise(resolve => {
        const ease = Expo.easeOut

        this.timelineOut = new TimelineMax({
          onComplete
        })

        this.timelineOut.to(this.position, 2, {
          ease,
          y: this.sizes.environment.height * 1.33
        })

        this.timelineOut.call(() => {
          resolve()
        })
      })
    } else {
      onComplete()

      return Promise.resolve()
    }
  }

  /**
   * Set.
   */
  set (index) {
    each(this.children, (child, childIndex) => {
      if (index === childIndex)  {
        child.show()
      } else {
        child.hide()
      }
    })
  }

  /**
   * Destroy.
   */
  destroy () {
    each(this.children, child => {
      child.destroy()
    })
  }
}
