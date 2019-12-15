import EventEmitter from 'events'
import { each, map } from 'lodash'
import { Vector3 } from 'three'

import Background from './Background'
import Title from './Title'

export default class extends EventEmitter {
  constructor ({ cover, index, scene, sizes, titlesFills, titlesStrokes }) {
    super()

    this.index = index
    this.scene = scene
    this.sizes = sizes

    this.createBackground(cover, sizes)
    this.createTitles(sizes, titlesFills, titlesStrokes)
  }

  createBackground (cover, sizes) {
    this.background = new Background({
      cover,
      sizes
    })
  }

  createTitles (sizes, titlesFills, titlesStrokes) {
    this.titles = map(titlesFills, (value, index) => {
      const title = new Title({
        fill: titlesFills[index],
        index,
        sizes,
        stroke: titlesStrokes && titlesStrokes[index]
      })

      return title
    })
  }

  animate (next, previous) {
    return new Promise(resolve => {
      const ease = Power3.easeInOut

      /**
       * Background.
       */
      const { background: nextBackground } = next
      const { background: previousBackground } = previous

      const isBackgroundFromFrontToBack = previousBackground.position.z > nextBackground.position.z
      const isBackgroundDifferentPosition = Math.round(previousBackground.position.z) !== Math.round(nextBackground.position.z)

      this.scene.add(this.background)

      const timeline = new TimelineMax({
        onComplete: resolve
      })

      if (isBackgroundDifferentPosition) {
        timeline.fromTo(this.background.material.uniforms.distortion, 0.75, {
          value: 0
        }, {
          ease,
          repeat: 1,
          yoyo: true,
          value: isBackgroundFromFrontToBack ? -3 : 3
        }, 'start')
      }

      timeline.fromTo(this.background.material.uniforms.scale, 1.5, {
        value: previousBackground.material.uniforms.scale.value
      }, {
        ease,
        value: nextBackground.material.uniforms.scale.value
      }, 'start')

      timeline.fromTo(this.background.position, 1.5, {
        z: previousBackground.position.z
      }, {
        ease,
        z: nextBackground.position.z
      }, 'start')

      timeline.call(() => {
        this.scene.remove(this.background)
      })

      /**
       * Titles.
       */
      each(this.titles, (title, titleIndex) => {
        let nextTitle
        const nextTitlePosition = new Vector3()

        if (next.projects && next.projects[titleIndex]) {
          nextTitle = next.projects[titleIndex].title
        } else if (next.titles && next.titles.children[titleIndex]) {
          nextTitle = next.titles.children[titleIndex]
        }

        let previousTitle
        let previousTitlePosition = new Vector3()

        if (previous.projects && previous.projects[titleIndex]) {
          previousTitle = previous.projects[titleIndex].title
        } else if (previous.titles && previous.titles.children[titleIndex]) {
          previousTitle = previous.titles.children[titleIndex]
        }

        if (!nextTitle || !previousTitle) {
          return
        }

        this.scene.add(title)

        const timeline = new TimelineMax()

        nextTitle.updateMatrixWorld()
        nextTitle.getWorldPosition(nextTitlePosition)

        previousTitle.updateMatrixWorld()
        previousTitle.getWorldPosition(previousTitlePosition)

        const isTitleFromFrontToBack = previousTitle.scaling > nextTitle.scaling
        const isTitleDifferentScaling = previousTitle.scaling !== nextTitle.scaling

        if (isTitleDifferentScaling) {
          timeline.fromTo(title.scale, 1.5, {
            x: previousTitle.scaling,
            y: previousTitle.scaling,
            z: previousTitle.scaling
          }, {
            ease,
            x: nextTitle.scaling,
            y: nextTitle.scaling,
            z: nextTitle.scaling
          }, 'start')
        } else {
          title.scale.x = previousTitle.scaling
          title.scale.y = previousTitle.scaling
          title.scale.z = previousTitle.scaling
        }

        if (next.name === 'Case') {
          let y = nextTitlePosition.y

          if (this.index < titleIndex) {
            y -= this.sizes.environment.height * 1.33
          } else if (this.index > titleIndex) {
            y += this.sizes.environment.height * 1.33
          }

          timeline.fromTo(title.position, 1.5, {
            x: previousTitlePosition.x,
            y: previousTitlePosition.y,
            z: previousTitlePosition.z
          }, {
            ease,
            x: nextTitlePosition.x,
            y,
            z: nextTitlePosition.z
          }, 'start')
        }

        if (next.name === 'Home') {
          let y = this.index === titleIndex ? nextTitlePosition.y : previousTitlePosition.y

          if (this.index < titleIndex) {
            y -= this.sizes.environment.height * 1.33
          } else if (this.index > titleIndex) {
            y += this.sizes.environment.height * 1.33
          }

          timeline.fromTo(title.position, 1.5, {
            x: previousTitlePosition.x,
            y: previousTitlePosition.y,
            z: previousTitlePosition.z
          }, {
            ease,
            x: nextTitlePosition.x,
            y,
            z: nextTitlePosition.z
          }, 'start')
        }

        if (next.name === 'Indexes') {
          let y = previous.name === 'Case' ? previousTitlePosition.y : previousTitle.y

          if (this.index < titleIndex) {
            y -= this.sizes.environment.height * 1.33
          } else if (this.index > titleIndex) {
            y += this.sizes.environment.height * 1.33
          }

          timeline.fromTo(title.position, 1.5, {
            x: previousTitlePosition.x,
            y,
            z: previousTitlePosition.z
          }, {
            ease,
            x: nextTitlePosition.x,
            y: nextTitlePosition.y + nextTitle.parent.position.y,
            z: nextTitlePosition.z
          }, 'start')
        }

        timeline.fromTo(title.material.uniforms.distortion, 0.75, {
          value: 0
        }, {
          ease,
          repeat: 1,
          yoyo: true,
          value: isTitleFromFrontToBack ? -5 : 5
        }, 'start')

        timeline.fromTo(title.material.uniforms.transition, 1.5, {
          value: previousTitle.material.uniforms.transition.value
        }, {
          ease,
          value: nextTitle.material.uniforms.transition.value
        }, 'start')

        timeline.fromTo(title.material.uniforms.alpha, 1.5, {
          value: previousTitle.material.uniforms.alpha.value
        }, {
          ease,
          value: nextTitle.material.uniforms.alpha.value
        }, 'start')

        timeline.call(() => {
          this.scene.remove(title)
        })
      })
    })
  }
}
