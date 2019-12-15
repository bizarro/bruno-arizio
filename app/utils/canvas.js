if (CanvasRenderingContext2D && !CanvasRenderingContext2D.renderText) {
  CanvasRenderingContext2D.prototype.renderText = function (text, x, y, letterSpacing) {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return
    }

    if (typeof letterSpacing === 'undefined') {
      letterSpacing = 0
    }

    let characters = String.prototype.split.call(text, '')
    let index = 0
    let current
    let currentPosition = x
    let align = 1

    if (this.textAlign === 'right') {
      align = -1
      characters = characters.reverse()
    } else if (this.textAlign === 'center') {
      let totalWidth = 0

      for (var i = 0; i < characters.length; i++) {
        totalWidth += (this.measureText(characters[i]).width + letterSpacing)
      }

      currentPosition = x - (totalWidth / 2)
    }

    while (index < text.length) {
      current = characters[index++]

      this.fillText(current, currentPosition, y)

      currentPosition += (align * (this.measureText(current).width + letterSpacing))
    }
  }
}

if (CanvasRenderingContext2D && !CanvasRenderingContext2D.renderStrokeText) {
  CanvasRenderingContext2D.prototype.renderStrokeText = function (text, x, y, letterSpacing) {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return
    }

    if (typeof letterSpacing === 'undefined') {
      letterSpacing = 0
    }

    let characters = String.prototype.split.call(text, '')
    let index = 0
    let current
    let currentPosition = x
    let align = 1

    if (this.textAlign === 'right') {
      align = -1
      characters = characters.reverse()
    } else if (this.textAlign === 'center') {
      let totalWidth = 0

      for (var i = 0; i < characters.length; i++) {
        totalWidth += (this.measureText(characters[i]).width + letterSpacing)
      }

      currentPosition = x - (totalWidth / 2)
    }

    while (index < text.length) {
      current = characters[index++]

      this.strokeText(current, currentPosition, y)

      currentPosition += (align * (this.measureText(current).width + letterSpacing))
    }
  }
}

function rowBlank (imageData, width, y) {
  for (let x = 0; x < width; x += 1) {
    if (imageData.data[(y * (width * 4)) + ((x * 4) + 3)] !== 0) return false
  }

  return true
}

function columnBlank (imageData, width, x, top, bottom) {
  for (let y = top; y < bottom; y += 1) {
    if (imageData.data[(y * (width * 4)) + ((x * 4) + 3)] !== 0) return false
  }

  return true
}

export function trim (canvas) {
  const context = canvas.getContext('2d')
  const height = canvas.height
  const width = canvas.width

  const imageData = context.getImageData(0, 0, width, height)

  let top = 0
  let bottom = imageData.height
  let left = 0
  let right = imageData.width

  while (top < bottom && rowBlank(imageData, width, top)) {
    top += 1
  }

  while (bottom - 1 > top && rowBlank(imageData, width, bottom - 1)) {
    bottom -= 1
  }

  while (left < right && columnBlank(imageData, width, left, top, bottom)) {
    left += 1
  }

  while (right - 1 > left && columnBlank(imageData, width, right - 1, top, bottom)) {
    right -= 1
  }

  try {
    const trimmed = context.getImageData(left, top, right - left, bottom - top)

    const copy = canvas.ownerDocument.createElement('canvas')
    const copyContext = copy.getContext('2d')

    copy.width = trimmed.width
    copy.height = trimmed.height

    copyContext.putImageData(trimmed, 0, 0)

    return copy
  } catch (error) {
    return false
  }
}
