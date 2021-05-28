const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskthree,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('should create task for user.', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Testing'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('should not delete other user tasks', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid description', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: new Object
        })
        .expect(400)
})

test('Should not create task with invalid completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'correct description',
            completed: 'incorrect completed value'
        })
        .expect(400)
})

test('Should not update task with invalid description', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: new Object
        })
        .expect(400)
    
    const task = await Task.findById(taskOne._id)
    expect(task.description).toEqual(taskOne.description)
})

test('Should not update task with invalid completed', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'correct description',
            completed: 'incorrect completed value'
        })
        .expect(400)
    
    const task = await Task.findById(taskOne._id)
    expect(task.completed).toEqual(taskOne.completed)
})

test('Should delete user task', async () => {
    await request(app)
        .delete(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
 
    const task = await Task.findById(taskTwo._id) 
    expect(task).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskthree._id}`)
        .send()
        .expect(401)
 
    const task = await Task.findById(taskthree._id) 
    expect(task).not.toBeNull()
    expect(task).toMatchObject(taskthree)
})

test('Should not update other users task', async () => {
    await request(app)
        .patch(`/tasks/${taskthree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'correct description'
        })
        .expect(404)
    
    const task = await Task.findById(taskthree._id)
    expect(task).not.toBeNull()
    expect(task).toMatchObject(taskthree)
})

test('Should fetch user task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
 
    expect(response).not.toBeNull()
    expect(JSON.stringify(response.body._id)).toBe(JSON.stringify(taskOne._id))
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toEqual(1)
    expect(response.body[0].completed).toEqual(true)
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toEqual(1)
    expect(response.body[0].completed).toEqual(false)
})

test('Should sort tasks by description', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=description:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toEqual(taskOne.description)
    expect(response.body[1].description).toEqual(taskTwo.description)
})

test('Should sort tasks by completed', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=completed:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].completed).toEqual(taskOne.completed)
    expect(response.body[1].completed).toEqual(taskTwo.completed)
})

test('Should sort tasks by createdAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const task1 = await Task.findById(taskOne._id)
    const task2 = await Task.findById(taskTwo._id)
    expect(JSON.stringify(response.body[0].createdAt)).toEqual(JSON.stringify(task1.createdAt))
    expect(JSON.stringify(response.body[1].createdAt)).toEqual(JSON.stringify(task2.createdAt))
})

test('Should sort tasks by updatedAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const task1 = await Task.findById(taskOne._id)
    const task2 = await Task.findById(taskTwo._id)
    expect(JSON.stringify(response.body[0].updatedAt)).toEqual(JSON.stringify(task1.updatedAt))
    expect(JSON.stringify(response.body[1].updatedAt)).toEqual(JSON.stringify(task2.updatedAt))
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=description:asc&limit=1&skip=0')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(1)
    
    const task1 = await Task.findById(taskOne._id)
    expect(JSON.stringify(response.body[0].description)).toEqual(JSON.stringify(task1.description))
})