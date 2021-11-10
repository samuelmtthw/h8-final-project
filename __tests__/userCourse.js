const request = require('supertest')
const app = require('../app.js')
const { UserCourse, User, Course, Category } = require('../models')

let userToken

beforeAll( async () => {
    user = await User.create({
        name: "Jhon", 
        email: "jhon@gmail.com", 
        password: "12345678", 
        role: "User"
    })

    await Category.create({
        name: "Matematika"
    })

    for( let i = 0; i < 2; i++) {
        await Course.create({
            name: `Test Course ${i}`,
            description: `Matematika ilmu yang menyenangkan.....`,
            price: 145000,
            thumbnailUrl: "https://i.ytimg.com/vi/WJr11FExG7s/hqdefault.jpg?s…RUAAIhCGAE=&rs=AOn4CLAImD8rRbQR7cuFCw3Z_xsjLlr1Tg",
            difficulty: "medium",
            status: "active",
            rating: 8,
            CategoryId: 1
        })
    }

    await UserCourse.create({
        UserId: 1,
        CourseId: 1,
        isPaid: false
    })

    // login to take a access_token
    userToken = await request(app)
        .post('/public/login')
        .send({email: "jhon@gmail.com", password: "12345678"})
})

afterAll( async ()=>{
    await User.destroy({ truncate: true, cascade: true, restartIdentity: true });
    await Category.destroy({ truncate: true, cascade: true, restartIdentity: true });
    await Course.destroy({ truncate: true, cascade: true, restartIdentity: true });
    await UserCourse.destroy({ truncate: true, cascade: true, restartIdentity: true });
})



describe('GET /public/userCourse', () => {
    test('[200 - Success] get all userCourse with id user login', (done) => {
        request(app)
        .get('/public/userCourse')
        .set(
            "access_token",
            userToken.body.access_token
        )
        .then((response) => {
            const { status, body } = response
            expect(status).toBe(200)
            expect(body).toEqual(expect.any(Object))
            expect(body[0]).toHaveProperty('UserId')
            expect(body[0]).toHaveProperty('CourseId')
            expect(body[0]).toHaveProperty('isPaid')
            done()
        })
        .catch((err) => {
            done(err)
        })
    })

    test('[401 - InvalidInput] get all userCourse before login', (done) => {
        request(app)
        .get('/public/userCourse')
        .set(
            "access_token",
            ""
        )
        .then((response) => {
            const { status, body } = response
            expect(status).toBe(401)
            expect(body).toEqual(expect.any(Object))
            expect(body).toHaveProperty('message', "Invalid email/password")
            done()
        })
        .catch((err) => {
            done(err)
        })
    })

    test('[401 - InvalidInput] get all userCourse after login with invalid account', (done) => {
        request(app)
        .get('/public/userCourse')
        .set(
            "access_token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2MzY1NjExOTN9.acunlADBP6o5d9VaJ8xFu9ldRM93SLcFE9yBsmqMHuk"
        )
        .then((response) => {
            const { status, body } = response
            expect(status).toBe(401)
            expect(body).toEqual(expect.any(Object))
            expect(body).toHaveProperty('message', "Invalid email/password")
            done()
        })
        .catch((err) => {
            done(err)
        })
    })

    test('[401 - JsonWebTokenError] get all userCourse after login with invalid token', (done) => {
        request(app)
        .get('/public/userCourse')
        .set(
            "access_token",
            "BP6o5d9VaJ8xFu9ldRM93SLcFE9yBsmqMHuk"
        )
        .then((response) => {
            const { status, body } = response
            expect(status).toBe(401)
            expect(body).toEqual(expect.any(Object))
            expect(body).toHaveProperty('message', "Unauthorized")
            done()
        })
        .catch((err) => {
            done(err)
        })
    })
})