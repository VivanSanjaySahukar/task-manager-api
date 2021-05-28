const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should signup a new user.', async () => {
    const response = await request(app).post('/users').send({
        name: 'Vivan',
        email: 'spjayanth55@example.com',
        password: 'passmy1111'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Vivan',
            email: 'spjayanth55@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('passmy1111')
})

test('should login existing user.', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login nonexisting user.', async () => {
    await request(app).post('/users/login').send({
        email: userOne.mail,
        password: 'qweerty123'
    }).expect(400)
})

test('should get profile for user.', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unauthorized user.', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete profile for user.', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delet profile for unauthorized user.', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('should upload avatar image.', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user field.', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jessica'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jessica')
})

test('should not update invalid user field.', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            locaation: 'singapore'
        })
        .expect(400)
})

test('Should not signup user with invalid name', async () => {
    await request(app)
        .post('/users')
        .send({
            name: {},
            email: 'correct@email.com',
            password: 'correctPa$$w0rd'
        })
        .expect(400)
})

test('Should not signup user with invalid email', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Correct Nane',
            email: 'correctemail.com',
            password: 'correctPa$$w0rd'
        })
        .expect(400)
})

test('Should not signup user with invalid password', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Correct Nane',
            email: 'correct@email.com',
            password: {}
        })
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Correct Nane',
            email: 'correct@email.com',
            password: 'correctPa$$w0rd'
        })
        .expect(401)
})

test('Should not update user with invalid name', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: new Array
        })
        .expect(400)
})

test('Should not update user with invalid email', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: new Array
        })
        .expect(400)
})

test('Should not update user with invalid password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: new Array
        })
        .expect(400)
})

test('Should not delete user if unauthenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})