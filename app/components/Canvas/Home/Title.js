import {
  AdditiveBlending,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial
} from 'three'

import fragmentShader from 'shaders/title-frag.glsl'
import vertexShader from 'shaders/title-vert.glsl'

import { Detection } from 'classes/Detection'

import { map } from 'utils/math'

export default class extends Mesh {
  constructor ({ fill, index, sizes }) {
    super()

    this.index = index
    this.sizes = sizes

    this.scaling = Detection.isPhone ? 0.25 : 1

    this.createGeometry(fill, sizes)
    this.createMaterial(fill, sizes)
  }

  /**
   * Create.
   */
  createGeometry ({ image }, { environment, ratio, screen }) {
    const ratioHeight = (image.height * ratio / screen.height / 2)
    const ratioWidth = (image.width * ratio / screen.width / 2)

    this.height = environment.height * ratioHeight * this.scaling
    this.width = environment.width * ratioWidth * this.scaling

    this.geometry = new PlaneBufferGeometry(this.width, this.height, 100, 50)

    if (Detection.isPhone) {
      this.x = (this.width * 0.5) - (environment.width * 0.5) + (0.035 * environment.width)
      this.y = -(environment.height * 0.475) + (0.495 * environment.width)
    } else {
      this.x = (this.width * 0.5) - (environment.width * 0.5) + (0.025 * environment.width)
      this.y = -(environment.height * 0.5) + (this.height * 0.8)
    }

    this.position.y = this.y
    this.position.z = 0.01
  }

  createMaterial (fill, { screen }) {
    this.material = new ShaderMaterial({
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        alpha: {
          value: 1
        },
        distortion: {
          value: 1
        },
        distortionX: {
          value: fill.image.width > screen.width ? 1.4 : 1.75
        },
        distortionY: {
          value: 2
        },
        image: {
          value: fill
        },
        transition: {
          value: 1
        },
        width: {
          value: this.width
        }
      },
      transparent: true,
      fragmentShader,
      vertexShader
    })
  }

  /**
   * Events.
   */
  onResize ({ fill, sizes }) {
    this.sizes = sizes

    if (this.geometry) {
      this.destroyGeometry()
      this.createGeometry(fill, sizes)
    }

    if (this.material) {
      this.material.uniforms.image.value = fill
      this.material.uniforms.width.value = this.width
    }
  }

  /**
   * Animations.
   */
  show (isCurrent, pathname) {
    if (!isCurrent) {
      return
    }

    if (!pathname) {
      const ease = Power4.easeOut

      this.isAnimating = true

      this.timelineIn = new TimelineMax()

      this.timelineIn.fromTo(this.position, 2, {
        x: this.x + 75,
        y: this.y - this.sizes.environment.height,
        z: 50
      }, {
        ease,
        x: this.x,
        y: this.y,
        z: 0
      }, 'start')

      this.timelineIn.fromTo(this.rotation, 2, {
        x: Math.PI / 8
      }, {
        ease,
        x: 0
      }, 'start')

      this.timelineIn.fromTo(this.material.uniforms.alpha, 2, {
        value: 1
      }, {
        ease,
        value: 0
      }, 'start')

      this.timelineIn.fromTo(this.material.uniforms.distortion, 2, {
        value: 5
      }, {
        ease,
        value: 0
      }, 'start')

      this.timelineIn.call(() => {
        this.isAnimating = false
      })
    } else if (pathname === 'about' || pathname === 'essays') {
      const ease = Power4.easeOut

      this.isAnimating = true

      this.timelineIn = new TimelineMax()

      this.timelineIn.fromTo(this.position, 2, {
        x: this.x + 75,
        y: this.y - this.sizes.environment.height,
        z: 50
      }, {
        ease,
        x: this.x,
        y: this.y,
        z: 0
      }, 'start')

      this.timelineIn.fromTo(this.rotation, 2, {
        x: Math.PI / 8
      }, {
        ease,
        x: 0
      }, 'start')

      this.timelineIn.fromTo(this.material.uniforms.alpha, 2, {
        value: 1
      }, {
        ease,
        value: 0
      }, 'start')

      this.timelineIn.fromTo(this.material.uniforms.distortion, 2, {
        value: 5
      }, {
        ease,
        value: 0
      }, 'start')

      this.timelineIn.call(() => {
        this.isAnimating = false
      })
    }
  }

  hide (isCurrent, pathname, onComplete) {
    if (pathname === 'about' || pathname === 'essays') {
      if (isCurrent) {
        return new Promise(resolve => {
          const ease = Power4.easeOut

          this.isAnimating = true

          this.timelineOut = new TimelineMax({
            onComplete
          })

          this.timelineOut.to(this.position, 2, {
            ease,
            x: this.x - 75,
            y: this.y + this.sizes.environment.height,
            z: 50
          }, 'start')

          this.timelineOut.to(this.rotation, 2, {
            ease,
            x: Math.PI / 8
          }, 'start')

          this.timelineOut.to(this.material.uniforms.alpha, 2, {
            value: 1
          }, 'start')

          this.timelineOut.to(this.material.uniforms.distortion, 2, {
            ease,
            value: 5
          }, 'start')

          this.timelineOut.call(() => {
            this.isAnimating = false

            resolve()
          })
        })
      } else {
        onComplete()

        return Promise.resolve()
      }
    } else {
      onComplete()

      return Promise.resolve()
    }
  }

  /**
   * Update.
   */
  update (percent) {
    if (this.isAnimating) {
      return
    }

    const percentAbsolute = Math.abs(percent)

    this.material.uniforms.alpha.value = map(percentAbsolute, 0, 0.5, 0, 1)
    this.material.uniforms.distortion.value = map(percentAbsolute, 0, 1, 0, 5)

    this.position.x = this.x + map(percent, -1.25, 1.25, 75, -75)
    this.position.z = map(percent, -1.25, 1.25, 50, -50)

    this.rotation.x = map(percent, -1.25, 1.25, Math.PI / 8, -Math.PI / 8)
  }

  /**
   * Destroy.
   */
  destroyGeometry () {
    if (this.geometry) {
      this.geometry.dispose()
    }
  }

  destroyMaterial () {
    if (this.material) {
      this.material.dispose()
    }
  }

  destroy () {
    this.destroyGeometry()
    this.destroyMaterial()
  }
}
