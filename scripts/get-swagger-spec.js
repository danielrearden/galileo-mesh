const fs = require('fs')
const path = require('path')
const fetch = require('cross-fetch')

// The url where the docs are hosted
const DOCS_URL = 'https://galileo-ft.readme.io/galileo-pro/reference'
// Regular expression for extracting docs JSON data from page HTML
const JSON_DATA_REGEXP = /<script id="readme-data-oasFiles" type="application\/json" data-json="(.*?)"><\/script>/
// ID for the OpenAPI spec to extract (the docs contain multiple ones)
const OAS_ID = '5ea9a4a90886900051ec1cd2'

async function getSwaggerSpec() {
  const res = await fetch(DOCS_URL)
  const html = await res.text()
  const [, encodedData] = JSON_DATA_REGEXP.exec(html);
  const data = encodedData.replace(/&quot;/g, '"')
  const originalSpec = JSON.parse(data)[OAS_ID]

  // Patch some issues with the original spec
  const spec = {
    ...originalSpec,
    paths: Object.keys(originalSpec.paths).reduce((acc, key) => {
      const pathObject = originalSpec.paths[key]
      acc[key] = Object.keys(pathObject).reduce((acc, key) => {
        const methodObject = pathObject[key]
        acc[key] = {
          ...methodObject,
          responses: Object.keys(methodObject.responses).reduce((acc, key) => {
            const responseObject = methodObject.responses[key]
            const content = { ...responseObject.content }
            if (content['*/*']) {
              content['application/json'] = { ...content['*/*'] }
              delete content['*/*']
            }
            acc[key] = {
              ...responseObject,
              content
            }
            return acc
          }, {})
        }
        return acc
      }, {})
      return acc
    }, {}),
    components: {
      ...originalSpec.components,
      schemas: Object.keys(originalSpec.components.schemas).reduce((acc, key) => {
        const schema = originalSpec.components.schemas[key]
        acc[key] = {
          ...schema,
          required: [],
        }
        return acc
      }, {})
    }
  }

  const specPath = path.join(__dirname, '../oas/program-api.json')
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2))
}

getSwaggerSpec()
  .then(() => {
    console.log('Done fetching swagger specification')
  })
  .catch(error => {
    console.log('Error encountered while fetching swagger specification\n\n', error)
  })
