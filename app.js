const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const format = require('date-fns/format')
const toDate = require('date-fns/toDate')
const isValid = require('date-fns/isValid')

const dbpath = path.join(__dirname, 'todoApplication.db')

app.use(express.json())

let db = null

const createdb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('server started'))
  } catch (error) {
    console.log(`db error ${error}`)
  }
}

createdb()

function haspriority(obj) {
  return obj.priority !== undefined
}

function haspriorityandstatus(obj) {
  return obj.priority !== undefined && obj.status !== undefined
}

function hasstatus(obj) {
  return obj.status !== undefined
}

function hascategory(obj) {
  return obj.category !== undefined
}

function hascategoryandpriority(obj) {
  return obj.category !== undefined && obj.priority !== undefined
}

function hascategoryandstatus(obj) {
  return obj.category !== undefined && obj.status !== undefined
}

const autenticationinsert = async (request, response, next) => {
  const {id, search_q = '', priority, status, category, date} = request.query
  console.log(request.query)
  if (priority !== undefined) {
    const list = ['HIGH', 'LOW', 'MEDIUM']
    if (list.includes(priority)) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
  if (status !== undefined) {
    const list = ['TO DO', 'IN PROGRESS', 'DONE']
    if (list.includes(status)) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }
  if (date !== undefined) {
    try {
      const myDate = new Date(date)
      const formatedDate = format(new Date(date), 'yyyy-MM-dd')

      const isValidDate = await isValid(myDate)
      console.log(isValidDate, 'V')
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  if (category !== undefined) {
    const list = ['WORK', 'HOME', 'LEARNING']
    if (list.includes(category)) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }
  request.todo = search_q
  next()
}

const autenticationupdate = async (request, response, next) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  const {todoId} = request.params
  console.log(todoId)
  console.log(request.body)
  if (priority !== undefined) {
    const list = ['HIGH', 'LOW', 'MEDIUM']
    if (list.includes(priority)) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
  if (status !== undefined) {
    const list = ['TO DO', 'IN PROGRESS', 'DONE']
    if (list.includes(status)) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }
  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate)
      const formatedDate = format(new Date(dueDate), 'yyyy-MM-dd')
      console.log(formatedDate, 'f')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      console.log(result, 'r')
      console.log(new Date(), 'new')

      const isValidDate = await isValid(result)
      console.log(isValidDate, 'V')
      if (isValidDate === true) {
        request.due_date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  if (category !== undefined) {
    const list = ['WORK', 'HOME', 'LEARNING']
    if (list.includes(category)) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }
  if (todoId !== undefined) {
    request.id = todoId
  } else {
    request.id = id
    request.todo = todo
  }
  if (todo !== undefined) {
    request.todo = todo
  }
  next()
}

app.get('/todos/', autenticationinsert, async (request, response) => {
  const {todo, priority, status, category} = request
  let query = ''
  switch (true) {
    case haspriorityandstatus(request):
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM 
        todo
      WHERE
        todo LIKE '%${todo}%'
        AND
        status='${status}'
        AND
        priority='${priority}';
      `
      break
    case hascategoryandstatus(request):
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM 
        todo
      WHERE
        todo LIKE '%${todo}%'
        AND
        status='${status}'
        AND
        category='${category}';
      `
      break
    case hascategoryandpriority(request):
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM 
        todo
      WHERE
        todo LIKE '%${todo}%'
        AND
        priority='${priority}'
        AND
        category='${category}';`
      break
    case haspriority(request):
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM 
        todo
      WHERE
        todo LIKE '%${todo}%'
        AND
        priority='${priority}';
      `
      break
    case hasstatus(request):
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo
      WHERE
        todo LIKE '%${todo}%'
        AND
        status='${status}';
      `
      break
    case hascategory(request):
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM 
        todo
      WHERE
        todo LIKE '%${todo}%'
        AND
        category='${category}';`
      break

    default:
      query = `
      SELECT 
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM 
        todo
      WHERE
        todo LIKE '%${todo}%';
      `
  }
  const data = await db.all(query)
  response.send(data)
})

app.get('/agenda/', autenticationinsert, async (request, response) => {
  const {date} = request
  const query = `
    SELECT 
      id,
      todo,
      priority,
      status,
      category,
      due_date AS dueDate
    FROM
      todo
    WHERE
      due_date='${date}';`
  const data = await db.all(query)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
  SELECT 
    id,
    todo,
    priority,
    status,
    category,
    due_date AS dueDate
  FROM
    todo
  WHERE
    id=${todoId};`
  const data = await db.get(query)
  response.send(data)
})

app.post('/todos/', autenticationupdate, async (request, response) => {
  const {id, todo, priority, status, category, due_date} = request
  const query = `
    INSERT INTO 
      todo(id,todo,priority,status,category,due_date)
    VALUES (${id},'${todo}','${priority}','${status}','${category}','${due_date}');`
  await db.run(query)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', autenticationupdate, async (request, response) => {
  const ele = request
  let p = null
  switch (true) {
    case ele.status !== undefined:
      p = 'Status'
      break
    case ele.priority !== undefined:
      p = 'Priority'
      break
    case ele.category !== undefined:
      p = 'Category'
      break
    case ele.due_date !== undefined:
      p = 'Due Date'
      break
    case ele.todo !== undefined:
      p = 'Todo'
      break
  }
  const query = `
    SELECT 
      * 
    FROM
      todo
    WHERE
      id=${ele.id};`
  const data = await db.get(query)
  const {
    id = data.id,
    todo = data.todo,
    priority = data.priority,
    status = data.status,
    category = data.category,
    due_date = data.due_date,
  } = request
  const code = `
  UPDATE 
    todo
  SET 
    todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${due_date}'
  WHERE
    id=${id};`
  await db.run(code)
  response.send(`${p} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const code = `
      DELETE FROM 
        todo
      WHERE
        id=${todoId};`
  await db.run(code)
  response.send('Todo Deleted')
})

module.exports = app
