import {
  AdditiveBlending,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial
} from 'three'

import fragmentShader from 'shaders/title-frag.glsl'
import vertexShader from 'shaders/title-vert.glsl'

import { Detection } from 'classes/Detection'

export default class extends Mesh {
  constructor ({ fill, sizes }) {
    super()

    this.sizes = sizes

    this.scaling = Detection.isPhone ? 0.125 : 0.375

    this.createGeometry(fill, sizes)
    this.createMaterial(fill)
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

    this.position.z = 0.01
  }

  createMaterial (fill) {
    this.material = new ShaderMaterial({
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        alpha: {
          value: 1
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
        transition: {
          value: 1
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
  onResize ({ sizes, fill }) {
    this.sizes = sizes

    if (this.geometry) {
      this.destroyGeometry()
      this.createGeometry(fill, sizes)
    }

    if (this.material) {
      this.material.uniforms.image.value = fill
    }
  }

  /**
   * Animations.
   */
  show () {
    this.material.uniforms.alpha.value = 0
  }

  hide () {
    this.material.uniforms.alpha.value = 1
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
