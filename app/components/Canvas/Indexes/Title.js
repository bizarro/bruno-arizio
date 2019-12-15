import {
  AdditiveBlending,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial
} from 'three'

import fragmentShader from 'shaders/title-frag.glsl'
import vertexShader from 'shaders/title-vert.glsl'

import { Detection } from 'classes/Detection'

import { lerp } from 'utils/math'

export default class extends Mesh {
  constructor ({ fill, index, sizes, stroke }) {
    super()

    this.index = index

    this.scaling = Detection.isPhone ? 1 : 0.375
    this.transition =  0

    this.createGeometry(fill, sizes)
    this.createMaterial(fill, stroke)
  }

  /**
   * Create.
   */
  createGeometry ({ image }, { environment, ratio, screen }) {
    const ratioHeight = (image.height * ratio / screen.height / 2)
    const ratioWidth = (image.width * ratio / screen.width / 2)

    this.height = environment.height * ratioHeight * this.scaling
    this.width = environment.width * ratioWidth * this.scaling

    this.padding = ratio * 10

    this.geometry = new PlaneBufferGeometry(this.width, this.height, 100, 50)

    this.position.x = (this.width * 0.5) - (environment.width * 0.425)
    this.position.y = -((this.height + this.padding) * this.index)
    this.position.z = 0.01
  }

  createMaterial (fill, stroke) {
    this.material = new ShaderMaterial({
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        alpha: {
          value: 0
        },
        distortion: {
          value: 0
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
        stroke: {
          value: stroke
        },
        transition: {
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
  onResize ({ fill, sizes, stroke }) {
    if (this.geometry) {
      this.destroyGeometry()
      this.createGeometry(fill, sizes)
    }

    if (this.material) {
      this.material.uniforms.image.value = fill
      this.material.uniforms.stroke.value = stroke
    }
  }

  /**
   * Animations.
   */
  show (pathname, onComplete) {

  }

  hide (pathname, onComplete) {

  }

  /**
   * Set.
   */
  set (isCurrent, isForced) {
    this.transition = isCurrent ? 1 : 0

    if (isForced) {
      this.material.uniforms.transition.value = this.transition
    }
  }

  /**
   * Update.
   */
  update () {
    this.material.uniforms.transition.value = lerp(this.material.uniforms.transition.value, this.transition, 0.1)
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
