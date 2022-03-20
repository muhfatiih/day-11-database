const { Pool } = require('pg')

const dbPool = new Pool ({
    database : 'personal_project',
    port : '5342' ,
    user : 'postgres',
    password : 'Fatih1453'
})

module.exports = dbPool;