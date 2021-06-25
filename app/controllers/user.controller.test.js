const express = require('express')
const supertest = require("supertest")
const privateRoutes = require('./../routes/private.route')

describe("User Controller", () => {
    const app = express()

    beforeAll(async (done) => {
        app.use(express.json())
        app.use('/', privateRoutes)
        done()
    })

    describe('me', () => {
        it('Sends back a 401 when no cookies are sent with the request',
            () => supertest(app).get('me').expect(401)
        )
    })
})