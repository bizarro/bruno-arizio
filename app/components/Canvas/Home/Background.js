import {
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector2
} from 'three'

import fragmentShader from 'shaders/image-frag.glsl'
import vertexShader from 'shaders/image-vert.glsl'

import { map } from 'utils/math'

export default class extends Mesh {
  constructor ({ cover, index, sizes }) {
    super()

    this.index = index
    this.sizes = sizes

    this.createGeometry(sizes)
    this.createMaterial(cover, sizes)
  }

  /**
   * Create.
   */
  createGeometry ({ environment }) {
    this.height = environment.height
    this.width = environment.width

    this.geometry = new PlaneBufferGeometry(this.width, this.height, 100, 50)

    this.position.z = -0.01
  }

  createMaterial (cover, { screen }) {
    this.material = new ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        alpha: {
          value: 1
        },
        displacementX: {
          value: 0
        },
        displacementY: {
          value: 0
        },
        distortion: {
          value: 0
        },
        distortionX: {
          value: 1.75
        },
        distortionY: {
          value: 2.0
        },
        image: {
          value: cover
        },
        imageResolution: {
          value: new Vector2(cover.image.width, cover.image.height)
        },
        resolution: {
          type: 'v2',
          value: new Vector2(screen.width, screen.height)
        },
        scale: {
          value: 0
        },
        time: {
          value: 0
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
  onTouchStart () {
    TweenMax.to(this.material.uniforms.displacementY, 0.4, {
      value: 0.1
    })
  }

  onTouchEnd () {
    TweenMax.killTweensOf(this.material.uniforms.displacementY)

    TweenMax.to(this.material.uniforms.displacementY, 0.4, {
      value: 0
    })
  }

  onResize ({ sizes }) {
    this.sizes = sizes

    if (this.geometry) {
      this.destroyGeometry()
      this.createGeometry(sizes)
    }

    if (this.material) {
      this.material.uniforms.resolution.value = new Vector2(sizes.screen.width, sizes.screen.height)
    }
  }

  /**
   * Animations.
   */
  show (isCurrent, pathname) {
    if (!isCurrent) {
      return
    }

    if (pathname === 'about' || pathname === 'essays') {
      const ease = Power4.easeOut

      this.isAnimating = true

      this.timelineIn = new TimelineMax()

      this.timelineIn.fromTo(this.position, 2, {
        y: -(this.sizes.environment.height * 1.33),
        z: -50
      }, {
        ease,
        y: 0,
        z: 0
      }, 'start')

      this.timelineIn.fromTo(this.material.uniforms.displacementY, 2, {
        value: 0.1
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

      this.timelineIn.fromTo(this.material.uniforms.scale, 2, {
        value: 0.5
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
            y: this.sizes.environment.height * 1.33,
            z: -50
          }, 'start')

          this.timelineOut.to(this.material.uniforms.displacementY, 2, {
            ease,
            value: 0.1
          }, 'start')

          this.timelineOut.to(this.material.uniforms.distortion, 2, {
            ease,
            value: 5
          }, 'start')

          this.timelineOut.to(this.material.uniforms.scale, 2, {
            ease,
            value: 0.5
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

    this.material.uniforms.distortion.value = map(percentAbsolute, 0, 1, 0, 5)
    this.material.uniforms.scale.value = map(percent, 0, 1, 0, 0.5)

    this.position.z = map(percentAbsolute, 0, 1, -0.01, -50)
  }

  animate (time) {
    this.material.uniforms.time.value = time
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
