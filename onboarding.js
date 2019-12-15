const request = require('request')

function trigger() {
  const repoRegexp = /^(https?:\/\/([-\w]+)\.[a-z]+\.(io|dev))\/api(\/v2)?$/
  const [_, endpoint] = process.env.PRISMIC_ENDPOINT.match(repoRegexp)

  request.post(`${endpoint}/app/settings/onboarding/run`, {
    form: {
      language: 'node',
      framework: 'express'
    }
  })
}

module.exports = {
  trigger
}
