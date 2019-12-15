require('dotenv').config()

const Prismic = require('prismic-javascript')
const PrismicDOM = require('prismic-dom')

const filter = require('lodash/filter')
const find = require('lodash/find')
const map = require('lodash/map')

const parser = require('ua-parser-js')

const Onboarding = require('./onboarding')

const app = require('./config')

const get = (results, request) => {
  const analytics = process.env.GOOGLE_ANALYTICS

  const ua = parser(request.headers['user-agent'])

  const functionals = find(results, { type: 'functionals' })
  const meta = find(results, { type: 'meta' })
  const navigation = find(results, { type: 'navigation' })
  const sharing = find(results, { type: 'sharing' })
  const social = find(results, { type: 'social' })

  const isDesktop = ua.device.type === undefined
  const isPhone = ua.device.type === 'mobile'
  const isTablet = ua.device.type === 'tablet'

  const projectsList = filter(results, { type: 'project' })
  const { data: { list: projectsOrder } } = find(results, { type: 'ordering' })

  const projects = map(projectsOrder, ({ project : { uid } }) => {
    return find(projectsList, { uid })
  })

  return {
    analytics,
    functionals,
    isDesktop,
    isPhone,
    isTablet,
    meta,
    navigation,
    projects,
    sharing,
    social
  }
}

app.listen(app.get('port'), () => {
  Onboarding.trigger()
})

app.use((request, response, next) => {
  const accessToken = process.env.PRISMIC_ACCESS_TOKEN
  const endpoint = process.env.PRISMIC_ENDPOINT

  response.locals.PrismicDOM = PrismicDOM

  Prismic.api(endpoint, {
    accessToken,
    request
  }).then(api => {
    request.prismic = { api }

    next()
  }).catch(error => {
    next(error.message)
  })
})

app.get('/', (request, response) => {
  request.prismic.api.query('', { pageSize : 100 }).then(({ results }) => {
    const home = find(results, { type: 'home' })

    const standard = get(results, request)

    response.render('pages/home', { home, ...standard })
  })
})

app.get('/index', (request, response) => {
  request.prismic.api.query('', { pageSize : 100 }).then(({ results }) => {
    const index = find(results, { type: 'index' })

    const standard = get(results, request)

    if (standard.isPhone) {
      response.redirect('/')
    } else {
      response.render('pages/index', { index, ...standard })
    }
  })
})

app.get('/about', (request, response) => {
  request.prismic.api.query('', { pageSize : 100 }).then(({ results }) => {
    const about = find(results, { type: 'about' })

    const standard = get(results, request)

    response.render('pages/about', { about, ...standard })
  })
})

app.get('/essays', (request, response) => {
  request.prismic.api.query('', { pageSize : 100 }).then(({ results }) => {
    const about = find(results, { type: 'about' })
    const essays = find(results, { type: 'essays' })

    const standard = get(results, request)

    response.render('pages/essays', { about, essays, ...standard })
  })
})

app.get('/case/:id', (request, response) => {
  request.prismic.api.query('', { pageSize : 100 }).then(({ results }) => {
    const standard = get(results, request)

    const { projects } = standard

    const cases = find(results, { type: 'projects' })
    const project = find(projects, { uid: request.params.id })
    const projectIndex = projects.indexOf(project)
    const related = projects[projectIndex + 1] ? projects[projectIndex + 1] : projects[0]

    response.render('pages/case', { ...standard, cases, project, projectIndex, related })
  })
})

app.use((request, response) => {
  response.status(404)

  if (request.accepts('html')) {
    response.redirect('/')

    return
  }

  if (request.accepts('json')) {
    response.send({ error: 'Not Found' })

    return
  }

  response.type('txt').send('Not Found')
})
