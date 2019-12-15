import { Group } from 'three'
import { each } from 'lodash'

import Title from './Title'

export default class extends Group {
  constructor ({ sizes, titlesFills, titlesStrokes }) {
    super()

    this.sizes = sizes

    this.createTitles(sizes, titlesFills, titlesStrokes)
  }

  /**
   * Create.
   */
  createTitles (sizes, titlesFills, titlesStrokes) {
    each(titlesFills, (value, index) => {
      const title = new Title({
        fill: titlesFills[index],
        index,
        sizes,
        stroke: titlesStrokes[index]
      })

      this.add(title)

      this.height = this.children[0].height + this.children[0].padding
    })
  }

  /**
   * Events.
   */
  onResize ({ sizes, titlesFills, titlesStrokes }) {
    this.sizes = sizes

    each(this.children, (child, index) => {
      child.onResize({
        fill: titlesFills[index],
        sizes,
        stroke: titlesStrokes[index]
      })
    })

    this.height = this.children[0].height + this.children[0].padding
  }

  /**
   * Animations.
   */
  show (pathname, scroll, onComplete) {
    if (!pathname || pathname === 'about' || pathname === 'essays') {
      const ease = Power4.easeOut

      this.isAnimating = true

      this.timelineIn = new TimelineMax()

      this.timelineIn.fromTo(this.position, 2, {
        y: -(scroll.values.target + this.sizes.environment.height * 1.66)
      }, {
        ease,
        y: scroll.values.target
      }, 'start')

      this.timelineIn.call(() => {
        this.isAnimating = false
      })
    }
  }

  hide (pathname, onComplete) {
    if (pathname === 'about' || pathname === 'essays') {
      return new Promise(resolve => {
        const ease = Power4.easeOut

        this.isAnimating = true

        this.timelineOut = new TimelineMax({
          onComplete
        })

        this.timelineOut.to(this.position, 2, {
          ease,
          y: (this.sizes.environment.height * 1.66) + this.height
        })

        this.timelineOut.call(() => {
          this.isAnimating = false

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
  set (index, isForced) {
    each(this.children, (child, childIndex) => {
      child.set(childIndex === index, isForced)
    })
  }

  /**
   * Update.
   */
  update () {
    if (this.isAnimating) {
      return
    }

    each(this.children, child => {
      child.update()
    })
  }

  /**
   * Destroy.
   */
  destroyTitles () {
    each(this.children, child => {
      child.destroy()
    })
  }

  destroy () {
    this.destroyTitles()
  }
}
