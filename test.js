const db = require('./index')

async function test() {
  try {
    await db.init({ host: '127.0.0.1', port: 6379, db: 0 })
    await db.flushdb()
    await db.setObject('test:1', { a: 'b' })
    console.log(await db.type('test:1'))
    let exists = await db.exists('test:1')
    console.log(exists)
    await db.delete('test:1')
    exists = await db.exists('test:1')
    console.log(exists)

    console.log(await db.getObject('ggg'))
    await db.setObject('ggg', {})

    process.exit(0)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

test()
