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
  constructor ({ fill, index, sizes, stroke }) {
    super()

    this.index = index
    this.sizes = sizes

    this.createGeometry(fill, sizes)
    this.createMaterial(fill, stroke)
  }

  /**
   * Create.
   */
  createGeometry ({ image }, { environment, ratio, screen }) {
    const ratioHeight = (image.height * ratio / screen.height / 2)
    const ratioWidth = (image.width * ratio / screen.width / 2)

    this.height = environment.height * ratioHeight
    this.width = environment.width * ratioWidth

    this.geometry = new PlaneBufferGeometry(this.width, this.height, 100, 50)
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
    this.sizes = sizes

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
