import EventEmitter from 'events'
import FontFaceObserver from 'fontfaceobserver'

import { each, map } from 'lodash'
import { TextureLoader } from 'three'

import { Detection } from 'classes/Detection'
import { TweenMax } from 'gsap'

export default class extends EventEmitter {
  constructor () {
    super()

    this.counter = 0

    this.projects = map(APP.Projects, project => {
      if (Detection.isPhone) {
        return {
          cover: project.data.phone.url,
          titleFill: project.data.fill.url,
          titleStroke: project.data.stroke.url,
          uid: project.uid
        }
      } else if (Detection.isTablet) {
        return {
          cover: project.data.tablet.url,
          titleFill: project.data.fill.url,
          titleStroke: project.data.stroke.url,
          uid: project.uid
        }
      } else {
        return {
          cover: project.data.desktop.url,
          titleFill: project.data.fill.url,
          titleStroke: project.data.stroke.url,
          uid: project.uid
        }
      }
    })

    this.texts = [
      '1 — 23',
      '23 — 1',
      '4 — 53',
      '65 — 4',
      '7 — 78',
      '78 — 9',
      '10 — 0'
    ]

    this.loader = new TextureLoader()

    this.element = document.createElement('div')
    this.element.className = 'preloader'
    this.element.innerHTML = `
      <span class="preloader__text">
        <span class="preloader__numbers">
          ${this.texts[0]}
        </span>
      </span>
    `

    this.elements = {
      numbers: this.element.querySelector('.preloader__numbers')
    }
  }

  load () {
    const apercuProBold = new FontFaceObserver('Apercu Pro Bold')
    const apercuProMedium = new FontFaceObserver('Apercu Pro Medium')
    const apercuProRegular = new FontFaceObserver('Apercu Pro Regular')

    const timeout = 10000

    Promise.all([
      apercuProBold.load(null, timeout),
      apercuProMedium.load(null, timeout),
      apercuProRegular.load(null, timeout)
    ]).then(() => {
      this.emit('fonts')
    }).catch(() => {
      this.emit('fonts')
    })

    each(this.projects, ({ cover, titleFill, titleStroke, uid }, index) => {
      this.loader.load(cover, texture => {
        texture.index = index
        texture.uid = uid

        this.emit('cover', texture)

        this.loader.load(titleFill, texture => {
          texture.index = index
          texture.uid = uid

          this.emit('fill', texture)

          this.loader.load(titleStroke, texture => {
            texture.index = index
            texture.uid = uid

            this.emit('stroke', texture)

            this.onProgress()
          })
        })
      })
    })
  }

  onProgress () {
    this.counter += 1

    this.elements.numbers.innerHTML = this.texts[this.counter]

    if (this.counter === this.projects.length - 1) {
      this.onComplete()
    }
  }

  onComplete () {
    this.hide()
  }

  show () {
    this.timelineIn = new TimelineMax()

    this.timelineIn.call(() => document.body.appendChild(this.element))

    this.timelineIn.fromTo(this.elements.numbers, 1.5, {
      y: '100%'
    }, {
      ease: Power4.easeOut,
      y: '0%'
    })

    this.timelineIn.call(() => this.load())
  }

  hide () {
    if (this.timelineIn) {
      this.timelineIn.kill()
      this.timelineIn = null
    }

    this.timelineOut = new TimelineMax({
      delay: 1.5
    })

    this.timelineOut.to(this.elements.numbers, 1.5, {
      ease: Power4.easeOut,
      y: '-100%'
    })

    this.timelineOut.call(() => {
      document.body.removeChild(this.element)

      this.emit('complete')
    })
  }
}
