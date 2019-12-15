/* global XMLHttpRequest */

export function get (url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const done = 4
    const success = 200

    xhr.onreadystatechange = () => {
      if (xhr.readyState === done) {
        if (xhr.status === success) {
          resolve(xhr.responseText)
        } else {
          reject(xhr.responseText)
        }
      }
    }

    xhr.open('GET', url, true)
    xhr.send()
  })
}

export function post (url, params) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const done = 4
    const success = 200

    xhr.onreadystatechange = () => {
      if (xhr.readyState === done) {
        if (xhr.status === success) {
          resolve(xhr.responseText)
        } else {
          reject(xhr.responseText)
        }
      }
    }

    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send(params)
  })
}
